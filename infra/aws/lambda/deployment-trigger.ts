import {
  SSMClient,
  SendCommandCommand,
  GetCommandInvocationCommand,
} from '@aws-sdk/client-ssm';
import {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceResponse,
} from 'aws-lambda';

const ssm = new SSMClient({});

interface ResourceProperties {
  InstanceId: string;
  BucketName: string;
  DeploymentVersion: string; // Triggers redeployment when changed
}

/**
 * Lambda handler for triggering application deployments via SSM Run Command
 */
export const handler = async (
  event: CloudFormationCustomResourceEvent
): Promise<CloudFormationCustomResourceResponse> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const {
    RequestType,
    ResourceProperties: props,
    PhysicalResourceId,
  } = event;
  const { InstanceId, BucketName, DeploymentVersion } =
    props as unknown as ResourceProperties;

  try {
    // Only run deployment on Create and Update
    if (RequestType === 'Create' || RequestType === 'Update') {
      console.log(
        `Triggering deployment on instance ${InstanceId} from bucket ${BucketName}`
      );

      // Send SSM Run Command to execute deployment script
      const command = new SendCommandCommand({
        InstanceIds: [InstanceId],
        DocumentName: 'AWS-RunShellScript',
        Comment: `Deploy application (version: ${DeploymentVersion})`,
        Parameters: {
          commands: [`/home/ec2-user/deploy-app.sh ${BucketName}`],
          executionTimeout: ['300'], // 5 minutes timeout
        },
      });

      const response = await ssm.send(command);
      const commandId = response.Command?.CommandId;

      if (!commandId) {
        throw new Error('Failed to get command ID from SSM response');
      }

      console.log(`SSM Command sent. Command ID: ${commandId}`);

      // Wait a bit for the command to start executing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check command status (don't wait for completion to avoid Lambda timeout)
      try {
        const invocation = new GetCommandInvocationCommand({
          CommandId: commandId,
          InstanceId: InstanceId,
        });
        const invocationResponse = await ssm.send(invocation);
        console.log('Command status:', invocationResponse.Status);
        console.log(
          'Command output (initial):',
          invocationResponse.StandardOutputContent
        );
      } catch (error) {
        console.log('Command still initializing:', error);
      }

      return {
        Status: 'SUCCESS',
        PhysicalResourceId: PhysicalResourceId || `deployment-${Date.now()}`,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: {
          CommandId: commandId,
          Message: 'Deployment triggered successfully',
        },
      };
    }

    // For Delete operations, just return success
    console.log('Delete operation - no action needed');
    return {
      Status: 'SUCCESS',
      PhysicalResourceId:
        PhysicalResourceId || `deployment-${Date.now()}`,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      Status: 'FAILED',
      Reason: error instanceof Error ? error.message : 'Unknown error',
      PhysicalResourceId:
        PhysicalResourceId || `deployment-${Date.now()}`,
      StackId: event.StackId,
      RequestId: event.RequestId,
      LogicalResourceId: event.LogicalResourceId,
    };
  }
};
