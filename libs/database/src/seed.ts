import { drizzle } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import * as schema from './lib/schema.dev';
import { tipoDeDiariasTpl } from './lib/schema.dev';

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
    empresasTpl: {
      count: 10,
      columns: {
        razao: f.companyName(),
        fantasia: f.companyName(),
        cnpj: f.phoneNumber({ template: '###.###.###-##' }),
        phone: f.phoneNumber({ template: '(47) ##### ####' }),
      },
      with: {
        projetosTpl: [
          { weight: 0.8, count: [1, 2] },
          { weight: 0.2, count: [3, 4] },
        ],
      },
    },
    projetosTpl: {
      columns: {
        nome: f.companyName(),
      },
      count: 1,
      with: {
        diariasTpl: 10,
      },
    },
    diariasTpl: {
      count: 1,
    },
    tipoDeDiariasTpl: {
      count: 7,
      columns: {
        nome: f.valuesFromArray({
          values: [
            'presente',
            'falta',
            'doente',
            'paternidade',
            'maternidade',
            'casamento',
            'outros',
          ],
        }),
      },
    },
  }));
}

main();
