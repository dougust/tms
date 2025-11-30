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

export interface BeEc2ConstructProps {
  vpc: IVpc;
  environmentVariables?: Record<string, string>;
  deploymentBucket: IBucket;
  role: IRole;
}

class BeEc2Construct extends Construct {
  constructor(scope: Construct, id: string, props: BeEc2ConstructProps) {
    super(scope, id);

    const { vpc, deploymentBucket, role, environmentVariables } = props;

    // Security Group for EC2 instance
    const securityGroup = new SecurityGroup(this, 'DougustSecurityGroup', {
      vpc,
      description: 'Security group for Dougust NestJS application',
      allowAllOutbound: true,
    });

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

    // Create EC2 Instance - t2.micro is free tier eligible
    const instance = new Instance(this, 'DougustInstance', {
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
      },
      role,
      securityGroup,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      // Amazon Linux 2023 - free tier eligible
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
    });

    // Allocate Elastic IP (one Elastic IP is free when associated with running instance)
    const eip = new CfnEIP(this, 'DougustEIP', {
      instanceId: instance.instanceId,
    });

    new CfnOutput(scope, 'InstanceId', {
      value: instance.instanceId,
      description: 'EC2 Instance ID',
    });

    new CfnOutput(scope, 'InstancePublicIp', {
      value: instance.instancePublicIp,
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
}

export default BeEc2Construct;
