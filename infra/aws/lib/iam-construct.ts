import { Construct } from 'constructs';
import { ManagedPolicy, ServicePrincipal, Role } from 'aws-cdk-lib/aws-iam';
import { Environment, generateConstructName } from './utils';

class IamConstruct extends Construct {
  public readonly role: Role;

  constructor(scope: Construct, id: string, props: { environment: Environment }) {
    super(scope, id);

    const { environment } = props;

    // IAM Role for EC2 instance
    this.role = new Role(this,
      generateConstructName('ec2-role', environment)
      , {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      description: 'IAM role for Dougust EC2 instance',
    });

    // Add permissions for CloudWatch Logs (for monitoring)
    this.role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentServerPolicy')
    );

    // Add permissions for SSM (Systems Manager) for easier instance management
    this.role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );
  }
}

export default IamConstruct;
