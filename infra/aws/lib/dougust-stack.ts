import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import IamConstruct from './iam-construct';
import { S3DeploymentConstruct } from './s3-deployment-construct';
import { VpcConstruct } from './vpc-construct';
import BeEc2Construct from './be-ec2-construct';
import { SsmDeploymentConstruct } from './ssm-deployment-construct';
import { RdsConstruct } from './rds-construct';
import { DatabaseAccessLambdaConstruct } from './database-access-lambda-construct';
import { Port } from 'aws-cdk-lib/aws-ec2';
import { Environment } from './utils';

export interface DougustStackProps extends StackProps {
  environment: Environment;
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
    const rdsConstruct = new RdsConstruct(this, 'DougustRDSConstruct', {
      vpc,
    });

    // Grant EC2 role permission to read the database secret
    rdsConstruct.secret.grantRead(role);

    // Pass database connection info as environment variables (without credentials)
    const envWithDatabase = {
      ...environmentVariables,
      DB_SECRET_ARN: rdsConstruct.secret.secretArn,
      DB_HOST: rdsConstruct.dbEndpoint,
      DB_PORT: rdsConstruct.dbPort,
      DB_NAME: rdsConstruct.dbName,
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
    rdsConstruct.securityGroup.addIngressRule(
      ec2SecurityGroup,
      Port.tcp(5432),
      'Allow PostgreSQL access from EC2 instance'
    );

    // Create migration Lambda function
    const migrationLambda = new DatabaseAccessLambdaConstruct(
      this,
      'DougustMigrationLambda',
      {
        vpc,
        databaseSecret: rdsConstruct.secret,
        databaseSecurityGroup: rdsConstruct.securityGroup,
        dbHost: rdsConstruct.dbEndpoint,
        dbPort: rdsConstruct.dbPort,
        dbName: rdsConstruct.dbName,
      }
    );

    // SSM deployment trigger - runs deployment script on every deploy
    new SsmDeploymentConstruct(this, 'DougustDeploymentTrigger', {
      instance,
      deploymentBucket,
      // Optional: Use a hash of the dist folder to trigger deployments only when code changes
      deploymentVersion: Date.now().toString(),
    });

    // Output the migration Lambda function name for manual invocation
    new CfnOutput(this, 'MigrationLambdaName', {
      value: migrationLambda.migrationFunction.functionName,
      description: 'Lambda function name for running database migrations',
      exportName: `${this.stackName}-MigrationLambdaName`,
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
