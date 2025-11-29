#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { DougustStack } from '../lib/dougust-stack';
import { join } from 'path';

const app = new cdk.App();

// Path to the built application (relative to this file: infra/aws/bin/dougust.ts)
// Points to dist/apps/be in the root of the monorepo
const distPath = join(__dirname, '..', '..', '..', 'dist', 'apps', 'be');

// Environment variables for the application
const environmentVariables = {
  NODE_ENV: process.env['NODE_ENV'] || 'production',
  PORT: process.env['PORT'] || '3000',
  // Add more environment variables as needed
  // DATABASE_URL: process.env['DATABASE_URL'] || '',
};

new DougustStack(app, 'DougustStack', {
  distPath,
  environmentVariables,

  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: {
    account: process.env['CDK_DEFAULT_ACCOUNT'],
    region: process.env['CDK_DEFAULT_REGION'],
  },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
