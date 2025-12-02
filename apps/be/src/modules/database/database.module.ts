import { Module } from '@nestjs/common';
import { DrizzlePGModule } from '@knaadh/nestjs-drizzle-pg';
import * as schema from '@dougust/database';

@Module({
  imports: [
    DrizzlePGModule.registerAsync({
      tag: 'DRIZZLE_ORM',
      useFactory() {
        return {
          pg: {
            connection: 'pool',
            config: {
              connectionString: process.env.DATABASE_URL,
              ssl: {
                rejectUnauthorized: false, // Required for RDS SSL connections
                // TODO: For production, consider using RDS CA certificate
                // and set rejectUnauthorized: true for additional security
              },
            },
          },
          config: { schema: { ...schema } },
        };
      },
    }),
  ],
  exports: [DrizzlePGModule],
})
export class DrizzleModule {}
