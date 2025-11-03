import { drizzle } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import {
  funcionariosTpl,
  empresasTpl,
  cadastrosRelationsTpl,
} from './lib/schema.dev';

const schema = { funcionariosTpl, cadastrosTpl: empresasTpl, cadastrosRelationsTpl };

async function main() {
  const db = drizzle(process.env['DATABASE_URL']);

  await reset(db, schema);
  await seed(db, schema).refine((f) => ({
    funcionariosTpl: {
      count: 20,
      columns: {
        nome: f.fullName(),
        social: f.valuesFromArray({ values: [''] }),
        cpf: f.phoneNumber({ template: '###.###.###-##' }),
        phone: f.phoneNumber({ template: '(47) ##### ####' }),
      },
    },
  }));
}

main();
