import { Construct } from 'constructs';
import { Arn, CustomResource, Duration, Stack } from 'aws-cdk-lib/core';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import { Instance } from 'aws-cdk-lib/aws-ec2';

export interface SsmDeploymentConstructProps {
  /**
   * EC2 Instance ID to deploy to
   */
  instance: Instance;

  /**
   * S3 bucket containing the deployment artifacts
   */
  deploymentBucket: IBucket;

  /**
   * Deployment version/hash to trigger redeployments
   * Change this value to trigger a new deployment
   */
  deploymentVersion?: string;
}

/**
 * Construct that triggers application deployments on EC2 via SSM Run Command
 * This allows deployments without replacing the EC2 instance
 */
export class SsmDeploymentConstruct extends Construct {
  constructor(scope: Stack, id: string, props: SsmDeploymentConstructProps) {
    super(scope, id);

    const { instance, deploymentBucket, deploymentVersion } = props;

    // Lambda function that sends SSM Run Command
    const deploymentTriggerFn = new NodejsFunction(
      this,
      'DeploymentTriggerFunction',
      {
        entry: 'src/lambda/deployment-trigger.ts',
        handler: 'handler',
        runtime: Runtime.NODEJS_22_X,
        timeout: Duration.seconds(60),
        description: 'Triggers application deployment via SSM Run Command',
      }
    );

    const instanceArn = Arn.format(
      {
        service: 'ec2',
        resource: 'instance',
        resourceName: instance.instanceId,
      },
      scope
    );

    // Grant Lambda permission to send SSM commands to the instance
    deploymentTriggerFn.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:SendCommand'],
        resources: [instanceArn, 'arn:aws:ssm:*:*:document/AWS-RunShellScript'],
      })
    );

    // Grant permission to get command invocation details (requires wildcard resource)
    deploymentTriggerFn.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:GetCommandInvocation', 'ssm:ListCommandInvocations'],
        resources: ['*'],
      })
    );

    // Create Custom Resource Provider
    const provider = new Provider(this, 'DeploymentProvider', {
      onEventHandler: deploymentTriggerFn,
    });

    // Create Custom Resource that triggers on every deployment
    new CustomResource(this, 'DeploymentTrigger', {
      serviceToken: provider.serviceToken,
      properties: {
        InstanceId: instance.instanceId,
        BucketName: deploymentBucket.bucketName,
        // Change this value to trigger a new deployment
        DeploymentVersion: deploymentVersion || Date.now().toString(),
      },
    });
  }
}
