import * as cdk from 'aws-cdk-lib/core';
import { Stack, StackProps } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { Queue } from 'aws-cdk-lib/aws-sqs';


export class DougustStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    const queue = new Queue(this, 'DougustQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
    });
  }
}
