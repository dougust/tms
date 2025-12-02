import { Construct } from 'constructs';
import {
  AmazonLinuxCpuType,
  AmazonLinuxGeneration,
  AmazonLinuxImage,
  BlockDeviceVolume,
  CfnEIP,
  EbsDeviceVolumeType,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  ISecurityGroup,
  IVpc,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  UserData,
} from 'aws-cdk-lib/aws-ec2';
import { join } from 'node:path';
import { readFileSync } from 'fs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { CfnOutput } from 'aws-cdk-lib/core';
import { Environment, generateConstructName } from './utils';

export interface BeEc2ConstructProps {
  vpc: IVpc;
  environmentVariables?: Record<string, string>;
  deploymentBucket: IBucket;
  databaseSecurityGroup: ISecurityGroup;
  environment: Environment;
  role: IRole;
}

class BeEc2Construct extends Construct {
  public readonly instance: Instance;

  constructor(scope: Construct, id: string, public props: BeEc2ConstructProps) {
    super(scope, id);

    const { vpc, role, environment } = props;

    const securityGroup = this.createSecurityGroup();
    const userData = this.createUserData();

    this.instance = new Instance(
      this,
      generateConstructName('be-instance', environment),
      {
        vpc,
        vpcSubnets: {
          subnetType: SubnetType.PUBLIC,
        },
        role,
        securityGroup,
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
        machineImage: new AmazonLinuxImage({
          generation: AmazonLinuxGeneration.AMAZON_LINUX_2023,
          cpuType: AmazonLinuxCpuType.X86_64,
        }),
        userData,
        // Use default EBS volume (30 GB gp2/gp3 is free tier eligible)
        blockDevices: [
          {
            deviceName: '/dev/xvda',
            volume: BlockDeviceVolume.ebs(8, {
              volumeType: EbsDeviceVolumeType.GP3,
              encrypted: true,
            }),
          },
        ],
      }
    );

    // Allocate Elastic IP (one Elastic IP is free when associated with running instance)
    const eip = new CfnEIP(
      this,
      generateConstructName('ec2-eip', environment),
      {
        instanceId: this.instance.instanceId,
      }
    );

    new CfnOutput(scope, 'InstanceId', {
      value: this.instance.instanceId,
      description: 'EC2 Instance ID',
    });

    new CfnOutput(scope, 'InstancePublicIp', {
      value: this.instance.instancePublicIp,
      description: 'Public IP address of the EC2 instance',
    });

    new CfnOutput(scope, 'ElasticIP', {
      value: eip.ref,
      description: 'Elastic IP address (use this for DNS)',
    });

    new CfnOutput(scope, 'ApplicationURL', {
      value: `http://${eip.ref}`,
      description: 'URL to access the application (via Nginx)',
    });
  }

  createSecurityGroup() {
    const { vpc, environment, databaseSecurityGroup } = this.props;

    const securityGroup = new SecurityGroup(
      this,
      generateConstructName('ec2-security-group', environment),
      {
        vpc,
        description: 'Security group for Dougust NestJS application',
        allowAllOutbound: true,
      }
    );

    // Allow HTTP traffic (port 80)
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80),
      'Allow HTTP access'
    );

    // Allow HTTPS traffic (port 443)
    securityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(443),
      'Allow HTTPS access'
    );

    databaseSecurityGroup.addIngressRule(
      securityGroup,
      Port.tcp(5432),
      'Allow PostgreSQL access from EC2 instance'
    );

    return securityGroup;
  }

  createUserData() {
    const { deploymentBucket, environmentVariables } = this.props;

    // User Data script to set up the instance
    const userData = UserData.forLinux();

    // Build environment variables string
    const envVars = {
      NODE_ENV: 'production',
      PORT: '3000',
      ...(environmentVariables || {}),
    };

    const envFileContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Read setup scripts from files
    const scriptsPath = join(__dirname, '..', 'scripts');

    // 1. user data
    const beUserdata = readFileSync(
      join(scriptsPath, 'be-userdata.sh'),
      'utf-8'
    )
      .replace(/\{\{BUCKET_NAME\}\}/g, deploymentBucket.bucketName)
      .replace(/\{\{ENV_FILE_CONTENT\}\}/g, envFileContent);

    userData.addCommands(beUserdata);

    return userData;
  }
}

export default BeEc2Construct;
