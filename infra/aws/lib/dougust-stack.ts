import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import IamConstruct from './iam-construct';
import { S3DeploymentConstruct } from './s3-deployment-construct';
import { VpcConstruct } from './vpc-construct';
import BeEc2Construct from './be-ec2-construct';
import { SsmDeploymentConstruct } from './ssm-deployment-construct';

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

    const { role } = new IamConstruct(this, 'DougustIAMConstruct');
    const { deploymentBucket } = new S3DeploymentConstruct(
      this,
      'DougustDeploymentConstruct',
      {
        distPath,
      }
    );

    // Grant EC2 instance read access to the deployment bucket
    deploymentBucket.grantRead(role);

    const { vpc } = new VpcConstruct(this, 'DougustVPCConstruct');

    const { instance } = new BeEc2Construct(this, 'DougustEC2Construct', {
      environmentVariables,
      deploymentBucket,
      role,
      vpc,
    });

    // SSM deployment trigger - runs deployment script on every deploy
    new SsmDeploymentConstruct(this, 'DougustDeploymentTrigger', {
      instance,
      deploymentBucket,
      // Optional: Use a hash of the dist folder to trigger deployments only when code changes
      deploymentVersion: Date.now().toString(),
    });

    // this.tags.setTag('Environment', props.environment);
    this.tags.setTag('Project', 'Dougust');
    this.tags.setTag('ManagedBy', 'CDK');
    // this.tags.setTag(
    //   'CostCenter',
    //   props.environment === 'prod' ? 'Production' : 'Development'
    // );
  }
}
