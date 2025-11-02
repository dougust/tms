import { drizzle } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import * as schema from './lib/schema.dev';

async function main() {
  const db = drizzle(process.env['DATABASE_URL']);

  await reset(db, {
    funcionarios: schema.funcionariosTpl,
    cadastros: schema.cadastrosTpl,
  });
  await seed(db, {
    funcionarios: schema.funcionariosTpl,
    cadastros: schema.cadastrosTpl,
    cadastrosRelations: schema.cadastrosRelationsTpl,
  }).refine((f) => ({
    funcionarios: {
      count: 2,
      with: {
        cadastros: 1,
      },
    },
  }));
}

main();
