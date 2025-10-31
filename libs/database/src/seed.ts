import { drizzle } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import * as schema from './lib/schema.dev';

async function main() {
  const db = drizzle(process.env['DATABASE_URL']);

  await reset(db, schema);
  await seed(db, schema).refine((f) => ({
    users: {
      count: 2,
    },
    pessoas_juridicas: {
      count: 2,
    },
  }));
}

main();
