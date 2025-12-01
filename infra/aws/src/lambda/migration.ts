/**
 * Lambda function to run database migrations
 *
 * This function:
 * 1. Fetches database credentials from Secrets Manager
 * 2. Constructs the DATABASE_URL
 * 3. Runs Drizzle migrations against the RDS database
 */

import { Handler } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

interface MigrationEvent {
  secretArn: string;
  dbHost: string;
  dbPort: string;
  dbName: string;
}

interface MigrationResponse {
  statusCode: number;
  body: string;
}

const secretsManager = new SecretsManagerClient({});

export const handler: Handler<MigrationEvent, MigrationResponse> = async (event, context) => {
  console.log('[Migration] Starting database migration');
  console.log('[Migration] Event:', JSON.stringify(event, null, 2));

  const { secretArn, dbHost, dbPort, dbName } = event;

  try {
    // Fetch database credentials from Secrets Manager
    console.log('[Migration] Fetching database credentials from Secrets Manager');
    const secretResponse = await secretsManager.send(
      new GetSecretValueCommand({ SecretId: secretArn })
    );

    if (!secretResponse.SecretString) {
      throw new Error('Secret value is empty');
    }

    const credentials = JSON.parse(secretResponse.SecretString);
    const { username, password } = credentials;

    console.log('[Migration] Database credentials retrieved successfully');
    console.log('[Migration] Connecting to database:', { dbHost, dbPort, dbName, username });

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
