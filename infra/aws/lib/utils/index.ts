import { App } from 'aws-cdk-lib';

export type Environment = 'development' | 'production';

export const getEnvironment = (app: App) => {
  return (
    (app.node.tryGetContext('environment') as Environment) || 'development'
  );
};
