import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib/core';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Bucket } from 'aws-cdk-lib/aws-s3';

interface IS3DeploymentConstructProps {
  distPath: string;
}

export class S3DeploymentConstruct extends Construct {
  public readonly deploymentBucket: Bucket;

  constructor(
    scope: Construct,
    id: string,
    props: IS3DeploymentConstructProps
  ) {
    super(scope, id);

    const { distPath } = props;

    this.deploymentBucket = new Bucket(this, 'DougustDeploymentBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Upload the built application to S3
    new s3deploy.BucketDeployment(this, 'DeployApplication', {
      sources: [s3deploy.Source.asset(distPath)],
      destinationBucket: this.deploymentBucket,
      destinationKeyPrefix: 'app',
    });
  }
}
