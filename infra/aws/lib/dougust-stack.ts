import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import IamConstruct from './iam-construct';
import { S3DeploymentConstruct } from './s3-deployment-construct';
import { VpcConstruct } from './vpc-construct';
import BeEc2Construct from './be-ec2-construct';
import { LambdaDeploymentConstruct } from './lambda-deployment-construct';
import { DatabaseConstruct } from './database-construct';
import { LambdaWithDbAccessConstruct } from './lambda-with-db-access-construct';
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
    const databaseConstruct = new DatabaseConstruct(
      this,
      generateConstructName('database-construct', environment),
      {
        vpc,
        environment,
      }
    );

    // Grant EC2 role permission to read the database secret
    databaseConstruct.secret.grantRead(role);

    // Pass database connection info as environment variables (without credentials)
    const envWithDatabase = {
      ...environmentVariables,
      DB_SECRET_ARN: databaseConstruct.secret.secretArn,
      DB_HOST: databaseConstruct.dbEndpoint,
      DB_PORT: databaseConstruct.dbPort,
      DB_NAME: databaseConstruct.dbName,
    };

    // Create EC2 instance with database connection string
    const { instance } = new BeEc2Construct(
      this,
      generateConstructName('ec2-construct', environment),
      {
        databaseSecurityGroup: databaseConstruct.securityGroup,
        environmentVariables: envWithDatabase,
        deploymentBucket,
        role,
        vpc,
        environment,
      }
    );

    // Create migration Lambda function
    const migrationLambda = new LambdaWithDbAccessConstruct(
      this,
      generateConstructName('lambda-with-db-access-construct', environment),
      {
        vpc,
        environment,
        databaseSecret: databaseConstruct.secret,
        databaseSecurityGroup: databaseConstruct.securityGroup,
        dbHost: databaseConstruct.dbEndpoint,
        dbPort: databaseConstruct.dbPort,
        dbName: databaseConstruct.dbName,
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
    new LambdaDeploymentConstruct(
      this,
      generateConstructName('lambda-deployment-construct', environment),
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
