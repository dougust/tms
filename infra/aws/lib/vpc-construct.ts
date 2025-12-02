import { Construct } from 'constructs';
import {
  IVpc,
  SubnetType,
  Vpc,
  InterfaceVpcEndpoint,
  InterfaceVpcEndpointAwsService,
} from 'aws-cdk-lib/aws-ec2';
import { Environment, generateConstructName } from './utils';

export class VpcConstruct extends Construct {
  public readonly vpc: IVpc;

  constructor(
    scope: Construct,
    id: string,
    props: { environment: Environment }
  ) {
    super(scope, id);

    const { environment } = props;

    // Create VPC with public and private subnets
    // Using a simple configuration to stay within free tier
    this.vpc = new Vpc(this, generateConstructName('vpc', environment), {
      maxAzs: 2, // RDS requires at least 2 AZs for subnet groups
      natGateways: 0, // No NAT gateway (costs money)
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Create VPC endpoints for AWS services
    // This allows private resources (Lambda, RDS) to access AWS services without internet
    // VPC endpoints are free (no data transfer charges within same region)

    // Secrets Manager endpoint - Required for Lambda to fetch database credentials
    new InterfaceVpcEndpoint(
      this,
      generateConstructName('secrets-manager-endpoint', environment),
      {
        vpc: this.vpc,
        service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
        privateDnsEnabled: true, // Enable private DNS so SDK uses the endpoint automatically
      }
    );

    // Optional: Add other VPC endpoints as needed
    // Examples:
    // - S3 Gateway Endpoint (free)
    // - ECR (for container images)
    // - CloudWatch Logs (for Lambda logging from private subnet)
  }
}
