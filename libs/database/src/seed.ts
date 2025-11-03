import { drizzle } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import {
  funcionariosTpl,
  cadastrosTpl,
  cadastrosRelationsTpl,
} from './lib/schema.dev';

const schema = { funcionariosTpl, cadastrosTpl, cadastrosRelationsTpl };

async function main() {
  const db = drizzle(process.env['DATABASE_URL']);

  await reset(db, schema);
  await seed(db, schema).refine((f) => ({
    cadastrosTpl: {
      count: 20,
      with: {
        funcionariosTpl: 1
      },
      columns: {
        nomeRazao: f.fullName(),
        socialFantasia: f.valuesFromArray({ values: [''] }),
        cpfCnpj: f.phoneNumber({ template: '###.###.###-##' }),
        phone: f.phoneNumber({ template: '(47) ##### ####' }),
      },
    },
  }));
}

main();
