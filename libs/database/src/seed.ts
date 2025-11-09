import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import * as schemaDev from './lib/schema.dev';

const { lookupTpl,...schema } = schemaDev;

async function createLookups (db : NodePgDatabase) {
  const tipoDiariaValues = [
    'presente',
    'falta',
    'doente',
    'paternidade',
    'maternidade',
    'casamento',
    'outros',
  ];
  const tiposDiaria =  await db.insert(lookupTpl).values(tipoDiariaValues.map((value) => ({ nome: value, grupo: 'TipoDiaria' }))).returning({ id: lookupTpl.id });
  /*const funcaoValues = ['Encarregado', 'Peão', 'Outra função'];

  const lookupNomes = [...tipoDiariaValues, ...funcaoValues];
  const lookupGrupos = [
    ...Array(tipoDiariaValues.length).fill('TipoDiaria'),
    ...Array(funcaoValues.length).fill('Funcao'),
  ];*/

  return { tiposDiaria };
}

async function main() {
  const db = drizzle(process.env['DATABASE_URL']);

  await reset(db, schema);
  const  { tiposDiaria } =  await createLookups(db);
  await seed(db, schema).refine((f) => {

    return {
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
        columns: {
          tipoDiaria: f.valuesFromArray({ values: tiposDiaria.map((tipoDiaria) => tipoDiaria.id) }),
        }
      },

    };
  });

}

main();
