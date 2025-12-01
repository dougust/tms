import { App } from 'aws-cdk-lib';
import { APP_NAME } from '../constants';

export type Environment = 'development' | 'production';

export const getEnvironment = (app: App) => {
  return (
    (app.node.tryGetContext('environment') as Environment) || 'development'
  );
};

export const generateConstructName = (
  name: string,
  environment: Environment
): string => {
  return `${APP_NAME}-${name}-${environment}`;
};
