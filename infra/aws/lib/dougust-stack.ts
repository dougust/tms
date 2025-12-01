import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import IamConstruct from './iam-construct';
import { S3DeploymentConstruct } from './s3-deployment-construct';
import { VpcConstruct } from './vpc-construct';
import BeEc2Construct from './be-ec2-construct';
import { SsmDeploymentConstruct } from './ssm-deployment-construct';
import { RdsConstruct } from './rds-construct';
import { SecurityGroup, Peer, Port, IVpc } from 'aws-cdk-lib/aws-ec2';

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

    // Create RDS PostgreSQL database
    const { connectionString, securityGroup: dbSecurityGroup } =
      new RdsConstruct(this, 'DougustRDSConstruct', {
        vpc,
      });

    // Merge DATABASE_URL into environment variables
    const envWithDatabase = {
      ...environmentVariables,
      DATABASE_URL: connectionString,
    };

    // Create EC2 instance with database connection string
    const { instance, securityGroup: ec2SecurityGroup } = new BeEc2Construct(
      this,
      'DougustEC2Construct',
      {
        environmentVariables: envWithDatabase,
        deploymentBucket,
        role,
        vpc,
      }
    );

    // Allow inbound connections from EC2 instance
    dbSecurityGroup.addIngressRule(
      ec2SecurityGroup,
      Port.tcp(5432),
      'Allow PostgreSQL access from EC2 instance'
    );

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
