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
