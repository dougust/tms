import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib/core';
import { IFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { ISecurityGroup, IVpc, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Environment, generateConstructName } from './utils';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs/lib/function';

export interface DatabaseAcessLambdaConstructProps {
  vpc: IVpc;
  databaseSecret: ISecret;
  databaseSecurityGroup: ISecurityGroup;
  environment: Environment;
  dbHost: string;
  dbPort: string;
  dbName: string;
}

export class DatabaseAccessLambdaConstruct extends Construct {
  public readonly migrationFunction: IFunction;
  public readonly authPostRegistrationLambda: IFunction;
  public readonly securityGroup: ISecurityGroup;

  constructor(
    scope: Construct,
    id: string,
    public readonly props: DatabaseAcessLambdaConstructProps
  ) {
    super(scope, id);

    const { vpc, databaseSecurityGroup, environment } = props;

    this.securityGroup = new SecurityGroup(
      this,
      generateConstructName('db-lambdas-security-group', environment),
      {
        vpc,
        description: 'Security group for lambdas that access the database.',
        allowAllOutbound: true,
      }
    );

    // Allow Lambda to connect to RDS
    databaseSecurityGroup.addIngressRule(
      this.securityGroup,
      Port.tcp(5432),
      'Allow migration Lambda to access database'
    );

    // Lambda function for migrations
    this.migrationFunction = this.createMigrationLambda();
    this.authPostRegistrationLambda = this.createPostRegistrationLambda();

    // Grant Lambda permission to execute in VPC (ENI creation)
    this.migrationFunction.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'ec2:CreateNetworkInterface',
          'ec2:DescribeNetworkInterfaces',
          'ec2:DeleteNetworkInterface',
          'ec2:AssignPrivateIpAddresses',
          'ec2:UnassignPrivateIpAddresses',
        ],
        resources: ['*'],
      })
    );
  }

  createPostRegistrationLambda() {
    const { environment } = this.props;

    return new NodejsFunction(
      this,
      generateConstructName('auth-post-registration-lambda', environment),
      {
        entry: 'src/lambda/auth-post-registration.ts',
        handler: 'handler',
        timeout: Duration.seconds(3),
        description:
          'Updates database after user registration with email verification token. Invoked by Cognito after user confirmation.',
      }
    );
  }

  createMigrationLambda() {
    const { environment } = this.props;
    return this.createLambda(
      generateConstructName('migration-lambda', environment),
      {
        timeout: Duration.seconds(10),
        handler: 'handler',
        entry: 'src/lambda/migration.ts',
        bundling: {
          minify: true,
          sourceMap: true,
          commandHooks: {
            beforeBundling(inputDir: string, outputDir: string): string[] {
              return [];
            },
            beforeInstall(inputDir: string, outputDir: string): string[] {
              return [];
            },
            afterBundling(inputDir: string, outputDir: string): string[] {
              // Copy migration files to the Lambda bundle
              return [
                `mkdir -p ${outputDir}/drizzle`,
                `cp -r ${inputDir}/libs/database/drizzle/* ${outputDir}/drizzle/ 2>/dev/null || echo "No migrations found, will be empty"`,
              ];
            },
          },
        },
        description: 'Runs database migrations for Dougust application',
      }
    );
  }

  createLambda(name: string, props: NodejsFunctionProps) {
    const { vpc, databaseSecret, dbHost, dbPort, dbName, environment } =
      this.props;

    const lambdaFn = new NodejsFunction(this, name, {
      runtime: Runtime.NODEJS_22_X,
      vpc,
      vpcSubnets: {
        // Use private subnets for Lambda (same as RDS)
        subnetType: vpc.privateSubnets.length > 0 ? undefined : undefined,
      },
      securityGroups: [this.securityGroup],
      environment: {
        SECRET_ARN: databaseSecret.secretArn,
        DB_HOST: dbHost,
        DB_PORT: dbPort,
        DB_NAME: dbName,
        NODE_ENV: environment,
      },
      ...props,
    });

    // Grant Lambda permission to read the database secret
    databaseSecret.grantRead(lambdaFn);

    return lambdaFn;
  }
}
