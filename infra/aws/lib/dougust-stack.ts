import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import IamConstruct from './iam-construct';
import { S3DeploymentConstruct } from './s3-deployment-construct';
import { VpcConstruct } from './vpc-construct';
import BeEc2Construct from './be-ec2-construct';

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

    const { role } = new IamConstruct(scope, 'DougustIAMConstruct');
    const { deploymentBucket } = new S3DeploymentConstruct(
      scope,
      'DougustDeploymentConstruct',
      {
        distPath,
      }
    );

    // Grant EC2 instance read access to the deployment bucket
    deploymentBucket.grantRead(role);

    const { vpc } = new VpcConstruct(scope, 'DougustVPCConstruct');

    new BeEc2Construct(scope, 'DougustEC2Construct', {
      environmentVariables,
      deploymentBucket,
      role,
      vpc,
    });
  }
}
