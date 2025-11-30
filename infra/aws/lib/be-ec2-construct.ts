import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { CfnOutput } from 'aws-cdk-lib/core';

export interface BeEc2ConstructProps {
  vpc: IVpc;
  environmentVariables?: Record<string, string>;
  deploymentBucket: IBucket;
  role: IRole;
}

export class BeEc2Construct extends Construct {
  constructor(scope: Construct, id: string, props: BeEc2ConstructProps) {
    super(scope, id);

    const { vpc, deploymentBucket, role, environmentVariables } = props;

    // Security Group for EC2 instance
    const securityGroup = new ec2.SecurityGroup(this, 'DougustSecurityGroup', {
      vpc,
      description: 'Security group for Dougust NestJS application',
      allowAllOutbound: true,
    });

    // Allow HTTP traffic (port 80)
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP access'
    );

    // Allow HTTPS traffic (port 443)
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow HTTPS access'
    );

    // User Data script to set up the instance
    const userData = ec2.UserData.forLinux();

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

    // 1. Setup instance (install Node.js, PM2, etc.)
    const setupInstanceScript = readFileSync(
      join(scriptsPath, 'setup-instance.sh'),
      'utf-8'
    );

    // 2. Deploy application from S3
    const deployAppScript = readFileSync(
      join(scriptsPath, 'deploy-app.sh'),
      'utf-8'
    )
      .replace(/\{\{BUCKET_NAME\}\}/g, deploymentBucket.bucketName)
      .replace(/\{\{ENV_FILE_CONTENT\}\}/g, envFileContent);

    // 3. Setup Nginx reverse proxy
    const setupNginxScript = readFileSync(
      join(scriptsPath, 'setup-nginx.sh'),
      'utf-8'
    );

    // Combine all scripts with logging
    const fullScript = [
      '#!/bin/bash',
      'set -e',
      '',
      '# Log all output to a file for debugging',
      'exec > >(tee -a /var/log/user-data.log)',
      'exec 2>&1',
      '',
      'echo "========================================="',
      'echo "Starting Dougust deployment"',
      'echo "Time: $(date)"',
      'echo "========================================="',
      '',
      setupInstanceScript,
      '',
      deployAppScript,
      '',
      setupNginxScript,
      '',
      'echo "========================================="',
      'echo "Deployment complete!"',
      'echo "Time: $(date)"',
      'echo "========================================="',
      '',
      '# Create completion marker',
      'echo "Instance setup complete!" > /home/ec2-user/setup-complete.txt',
      'date >> /home/ec2-user/setup-complete.txt',
    ].join('\n');

    userData.addCommands(fullScript);

    // Create EC2 Instance - t2.micro is free tier eligible
    const instance = new ec2.Instance(this, 'DougustInstance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      role,
      securityGroup,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      // Amazon Linux 2023 - free tier eligible
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2023,
        cpuType: ec2.AmazonLinuxCpuType.X86_64,
      }),
      userData,
      // Use default EBS volume (30 GB gp2/gp3 is free tier eligible)
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(30, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
          }),
        },
      ],
    });

    // Allocate Elastic IP (one Elastic IP is free when associated with running instance)
    const eip = new ec2.CfnEIP(this, 'DougustEIP', {
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
