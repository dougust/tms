import { drizzle } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import * as schema from './lib/schema';

async function main() {
  const db = drizzle(process.env['DATABASE_URL']);

  await reset(db, schema);
  await seed(db, schema).refine((f) => ({
    businesses: {
      count: 2,
      with: {
        users: 3,
        pessoasJuridicas: 1,
      },
    },
  }));
}

main();
