/**
 * Lambda function to run database migrations
 *
 * This function:
 * 1. Fetches database credentials from Secrets Manager
 * 2. Constructs the DATABASE_URL
 * 3. Runs Drizzle migrations against the RDS database
 */

import { Context } from 'aws-lambda';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const secretsManager = new SecretsManagerClient({});

export const handler = async (_: Record<string, string>, context: Context) => {
  console.log('[Migration] Starting database migration');
  console.log('[Migration] Lambda request ID:', context.awsRequestId);

  // Read configuration from environment variables
  const secretArn = process.env['SECRET_ARN'];
  const dbHost = process.env['DB_HOST'];
  const dbPort = process.env['DB_PORT'];
  const dbName = process.env['DB_NAME'];

  // Validate required environment variables
  if (!secretArn || !dbHost || !dbPort || !dbName) {
    const missingVars = [];
    if (!secretArn) missingVars.push('SECRET_ARN');
    if (!dbHost) missingVars.push('DB_HOST');
    if (!dbPort) missingVars.push('DB_PORT');
    if (!dbName) missingVars.push('DB_NAME');

    const errorMessage = `Missing required environment variables: ${missingVars.join(
      ', '
    )}`;
    console.error('[Migration]', errorMessage);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Configuration error',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
    };
  }

  try {
    // Fetch database credentials from Secrets Manager
    console.log(
      '[Migration] Fetching database credentials from Secrets Manager'
    );
    const secretResponse = await secretsManager.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );

    if (!secretResponse.SecretString) {
      throw new Error('Secret value is empty');
    }

    const credentials = JSON.parse(secretResponse.SecretString);
    const { username, password } = credentials;

    console.log('[Migration] Database credentials retrieved successfully');
    console.log('[Migration] Connecting to database:', {
      dbHost,
      dbPort,
      dbName,
      username,
    });

    // Construct connection string
    const connectionString = `postgresql://${username}:${password}@${dbHost}:${dbPort}/${dbName}`;

    // Create database connection pool
    const pool = new Pool({
      connectionString,
      max: 1, // Lambda doesn't need many connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Create drizzle instance
    const db = drizzle(pool);

    // Run migrations
    console.log('[Migration] Running migrations from ./drizzle/core');
    await migrate(db, { migrationsFolder: 'drizzle/dev' });

    // Close the pool
    await pool.end();

    console.log('[Migration] ✓ Migrations completed successfully');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Migrations completed successfully',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('[Migration] ✗ Migration failed:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Migration failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
