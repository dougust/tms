import { Construct } from 'constructs';
import { ManagedPolicy, ServicePrincipal, Role } from 'aws-cdk-lib/aws-iam';

class IamConstruct extends Construct {
  public readonly role: Role;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // IAM Role for EC2 instance
    this.role = new Role(this, 'DougustEc2Role', {
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
