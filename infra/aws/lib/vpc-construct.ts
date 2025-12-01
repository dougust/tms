import { Construct } from 'constructs';
import { IVpc, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';

export class VpcConstruct extends Construct {
  public readonly vpc: IVpc;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create VPC with public and private subnets
    // Using a simple configuration to stay within free tier
    this.vpc = new Vpc(this, 'DougustVpc', {
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
  }
}
