import * as cdk from 'aws-cdk-lib/core';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface DougustStackProps extends StackProps {
  /**
   * Path to the built application (dist folder)
   */
  distPath: string;

  /**
   * Environment variables for the application
   */
  environmentVariables?: Record<string, string>;
}

export class DougustStack extends Stack {
  constructor(scope: Construct, id: string, props: DougustStackProps) {
    super(scope, id, props);

    const { distPath, environmentVariables } = props;

    // Create VPC with public subnet for the EC2 instance
    // Using a simple configuration to stay within free tier
    const vpc = new ec2.Vpc(this, 'DougustVpc', {
      maxAzs: 1, // Use only 1 AZ to minimize costs
      natGateways: 0, // No NAT gateway (costs money)
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

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

    // Allow application port (3000) - for direct access during development
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      'Allow NestJS application access'
    );

    // IAM Role for EC2 instance
    const role = new iam.Role(this, 'DougustEc2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'IAM role for Dougust EC2 instance',
    });

    // Add permissions for CloudWatch Logs (for monitoring)
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy')
    );

    // Add permissions for SSM (Systems Manager) for easier instance management
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );

    const deploymentBucket = new s3.Bucket(this, 'DougustDeploymentBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Grant EC2 instance read access to the deployment bucket
    deploymentBucket.grantRead(role);

    // Upload the built application to S3
    new s3deploy.BucketDeployment(this, 'DeployApplication', {
      sources: [s3deploy.Source.asset(distPath)],
      destinationBucket: deploymentBucket,
      destinationKeyPrefix: 'app',
    });

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
      .replace('{{BUCKET_NAME}}', deploymentBucket.bucketName)
      .replace('{{ENV_FILE_CONTENT}}', envFileContent);

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

    // Outputs
    new CfnOutput(this, 'InstanceId', {
      value: instance.instanceId,
      description: 'EC2 Instance ID',
    });

    new CfnOutput(this, 'InstancePublicIp', {
      value: instance.instancePublicIp,
      description: 'Public IP address of the EC2 instance',
    });

    new CfnOutput(this, 'ElasticIP', {
      value: eip.ref,
      description: 'Elastic IP address (use this for DNS)',
    });

    new CfnOutput(this, 'SSHCommand', {
      value: `ssh -i <your-key-pair.pem> ec2-user@${eip.ref}`,
      description: 'SSH command to connect to the instance',
    });

    new CfnOutput(this, 'ApplicationURL', {
      value: `http://${eip.ref}`,
      description: 'URL to access the application (via Nginx)',
    });

    new CfnOutput(this, 'DirectApplicationURL', {
      value: `http://${eip.ref}:3000/api`,
      description: 'Direct URL to access the NestJS application',
    });

    if (deploymentBucket) {
      new CfnOutput(this, 'DeploymentBucket', {
        value: deploymentBucket.bucketName,
        description: 'S3 bucket containing the deployed application',
      });
    }
  }
}
