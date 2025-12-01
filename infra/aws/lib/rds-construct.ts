import { Construct } from 'constructs';
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  PostgresEngineVersion,
  StorageType,
} from 'aws-cdk-lib/aws-rds';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  ISecurityGroup,
  IVpc,
  Port,
  SecurityGroup,
  SubnetType,
} from 'aws-cdk-lib/aws-ec2';
import { Duration, RemovalPolicy } from 'aws-cdk-lib/core';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export interface RdsConstructProps {
  vpc: IVpc;
}

export class RdsConstruct extends Construct {
  public readonly database: DatabaseInstance;
  public readonly securityGroup: ISecurityGroup;
  public readonly connectionString: string;

  constructor(scope: Construct, id: string, props: RdsConstructProps) {
    super(scope, id);

    const { vpc } = props;

    // Create a security group for the RDS instance
    this.securityGroup = new SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for PostgreSQL RDS instance',
      allowAllOutbound: true,
    });

    // Create secret for database credentials
    const dbCredentialsSecret = new Secret(this, 'DBCredentialsSecret', {
      secretName: 'dougust-db-credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'dougust',
        }),
        excludePunctuation: true,
        includeSpace: false,
        generateStringKey: 'password',
      },
    });

    // Create RDS PostgreSQL instance
    this.database = new DatabaseInstance(this, 'PostgresDatabase', {
      engine: DatabaseInstanceEngine.postgres({
        version: PostgresEngineVersion.VER_17_6,
      }),
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [this.securityGroup],
      credentials: Credentials.fromSecret(dbCredentialsSecret),
      // Free tier eligible settings
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MICRO),
      allocatedStorage: 20, // 20 GB is within free tier
      storageType: StorageType.GP2,
      maxAllocatedStorage: 100, // Auto-scaling limit
      // Database settings
      databaseName: 'dougust',
      port: 5432,
      // Backup and maintenance
      backupRetention: Duration.days(7),
      deleteAutomatedBackups: false,
      // Public accessibility
      publiclyAccessible: false,
      // Multi-AZ for production (disabled for free tier)
      multiAz: false,
      // Auto minor version upgrade
      autoMinorVersionUpgrade: true,
      // Storage encryption
      storageEncrypted: true,
      // Deletion protection (disable for dev/test)
      deletionProtection: false,
      removalPolicy: RemovalPolicy.SNAPSHOT,
    });

    // Build connection string using CDK tokens (will be resolved at deploy time)
    // Format: postgresql://username:password@host:port/database
    const username = dbCredentialsSecret
      .secretValueFromJson('username')
      .toString();
    const password = dbCredentialsSecret
      .secretValueFromJson('password')
      .toString();

    this.connectionString = `postgresql://${username}:${password}@${this.database.dbInstanceEndpointAddress}:${this.database.dbInstanceEndpointPort}/dougust`;
  }
}
