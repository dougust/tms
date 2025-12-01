import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import IamConstruct from './iam-construct';
import { S3DeploymentConstruct } from './s3-deployment-construct';
import { VpcConstruct } from './vpc-construct';
import BeEc2Construct from './be-ec2-construct';
import { SsmDeploymentConstruct } from './ssm-deployment-construct';
import { RdsConstruct } from './rds-construct';
import { DatabaseAccessLambdaConstruct } from './database-access-lambda-construct';
import { Environment, generateConstructName } from './utils';
import { AuthConstruct } from './auth-construct';

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

    const { distPath, environmentVariables, environment } = props;

    const { role } = new IamConstruct(
      this,
      generateConstructName('iam-construct', environment),
      { environment }
    );
    const { deploymentBucket } = new S3DeploymentConstruct(
      this,
      generateConstructName('s3-construct', environment),
      {
        distPath,
        environment,
      }
    );

    // Grant EC2 instance read access to the deployment bucket
    deploymentBucket.grantRead(role);

    const { vpc } = new VpcConstruct(
      this,
      generateConstructName('vpc-construct', environment),
      { environment }
    );

    // Create RDS PostgreSQL database
    const rdsConstruct = new RdsConstruct(
      this,
      generateConstructName('rds-construct', environment),
      {
        vpc,
        environment,
      }
    );

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
    const { instance } = new BeEc2Construct(
      this,
      generateConstructName('ec2-construct', environment),
      {
        databaseSecurityGroup: rdsConstruct.securityGroup,
        environmentVariables: envWithDatabase,
        deploymentBucket,
        role,
        vpc,
      }
    );

    // Create migration Lambda function
    const migrationLambda = new DatabaseAccessLambdaConstruct(
      this,
      generateConstructName('database-functions-construct', environment),
      {
        vpc,
        environment,
        databaseSecret: rdsConstruct.secret,
        databaseSecurityGroup: rdsConstruct.securityGroup,
        dbHost: rdsConstruct.dbEndpoint,
        dbPort: rdsConstruct.dbPort,
        dbName: rdsConstruct.dbName,
      }
    );

    new AuthConstruct(
      this,
      generateConstructName('auth-construct', environment),
      {
        environment,
        postRegistrationLambda: migrationLambda.authPostRegistrationLambda,
      }
    );

    // SSM deployment trigger - runs deployment script on every deploy
    new SsmDeploymentConstruct(
      this,
      generateConstructName('ssm-deployment-construct', environment),
      {
        instance,
        deploymentBucket,
        // Optional: Use a hash of the dist folder to trigger deployments only when code changes
        deploymentVersion: Date.now().toString(),
        environment,
      }
    );

    // Output the migration Lambda function name for manual invocation
    new CfnOutput(this, 'MigrationLambdaName', {
      value: migrationLambda.migrationFunction.functionName,
      description: 'Lambda function name for running database migrations',
      exportName: `${this.stackName}-MigrationLambdaName`,
    });

    this.tags.setTag('Environment', props.environment);
    this.tags.setTag('Project', 'Dougust');
    this.tags.setTag('ManagedBy', 'CDK');
    this.tags.setTag('CostCenter', props.environment);
  }
}
