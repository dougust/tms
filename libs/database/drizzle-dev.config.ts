import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle/dev',
  schema: './src/lib/schema.dev.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: '__drizzle_dev_migrations',
  },
  schemaFilter: [process.env.TENANT_ID],
});
