import { Construct } from 'constructs';
import { Duration } from 'aws-cdk-lib/core';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { ISecurityGroup, IVpc, Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { join } from 'path';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export interface MigrationLambdaConstructProps {
  vpc: IVpc;
  databaseSecret: ISecret;
  databaseSecurityGroup: ISecurityGroup;
  dbHost: string;
  dbPort: string;
  dbName: string;
}

export class MigrationLambdaConstruct extends Construct {
  public readonly migrationFunction: Function;
  public readonly securityGroup: ISecurityGroup;

  constructor(
    scope: Construct,
    id: string,
    props: MigrationLambdaConstructProps
  ) {
    super(scope, id);

    const {
      vpc,
      databaseSecret,
      databaseSecurityGroup,
      dbHost,
      dbPort,
      dbName,
    } = props;

    // Create security group for Lambda
    this.securityGroup = new SecurityGroup(this, 'MigrationLambdaSG', {
      vpc,
      description: 'Security group for database migration Lambda',
      allowAllOutbound: true,
    });

    // Allow Lambda to connect to RDS
    databaseSecurityGroup.addIngressRule(
      this.securityGroup,
      Port.tcp(5432),
      'Allow migration Lambda to access database'
    );

    // Lambda function for migrations
    this.migrationFunction = new NodejsFunction(this, 'MigrationFunction', {
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(10),
      handler: 'handler',
      entry: 'src/lambda/migration.ts',
      bundling: {
        minify: false,
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
        NODE_ENV: 'production',
      },
      logRetention: RetentionDays.ONE_WEEK,
      description: 'Runs database migrations for Dougust application',
    });

    // Grant Lambda permission to read the database secret
    databaseSecret.grantRead(this.migrationFunction);

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
}
