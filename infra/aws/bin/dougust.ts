#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { DougustStack } from '../lib/dougust-stack';
import { join } from 'path';
import { getEnvironment } from '../lib/utils';

const app = new cdk.App();

const environment = getEnvironment(app);

// Validate environment
if (!['development', 'production'].includes(environment)) {
  throw new Error(
    `Invalid environment: ${environment}. Must be development or production.`
  );
}

// Path to the built application (relative to this file: infra/aws/bin/dougust.ts)
// Points to dist/apps/be in the root of the monorepo
const distPath = join(__dirname, '..', '..', '..', 'dist', 'apps', 'be');

// Environment variables for the application
const environmentVariables = {
  NODE_ENV: environment,
  PORT: process.env['PORT'] || '3000',
  // Add more environment variables as needed
  // DATABASE_URL: process.env['DATABASE_URL'] || '',
};

new DougustStack(app, 'DougustStack', {
  environment,
  distPath,
  environmentVariables,

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  env: {
    account: process.env['CDK_DEFAULT_ACCOUNT'],
    region: process.env['CDK_DEFAULT_REGION'],
  },
});
