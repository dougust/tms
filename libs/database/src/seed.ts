import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import * as schema from './lib/schema';
import * as argon2 from 'argon2';

const {
  lookup,
  tenant,
  users,
  tenantMemberships,
  // Exclude non-table exports from reset/seed
  subscriptionTierEnum,
  userRoleEnum,
  empresasRelations,
  projetosRelations,
  funcionariosRelations,
  beneficiosRelations,
  usersRelations,
  sessionsRelations,
  tenantMembershipsRelations,
  ...tables
} = schema;

async function createLookups(db: NodePgDatabase) {
  const tipoDiariaValues = [
    'presente',
    'falta',
    'doente',
    'paternidade',
    'maternidade',
    'casamento',
    'outros',
  ];
  const tiposDiaria = await db
    .insert(lookup)
    .values(
      tipoDiariaValues.map((value) => ({ nome: value, grupo: 'TipoDiaria' }))
    )
    .returning({ id: lookup.id });

  const funcaoValues = ['Encarregado', 'Peão', 'Outra função'];
  const funcao = await db
    .insert(lookup)
    .values(funcaoValues.map((value) => ({ nome: value, grupo: 'Funcao' })))
    .returning({ id: lookup.id });

  const tipoBeneficioValues = [
    'valorDiaria',
    'valorAlmoco',
    'valorCafe',
    'valorSaudeOcupacional',
    'valorSaudePlano',
    'valorJanta',
    'valorDescontoCasa',
  ];
  const beneficio = await db
    .insert(lookup)
    .values(
      tipoBeneficioValues.map((value) => ({ nome: value, grupo: 'Beneficio' }))
    )
    .returning({ id: lookup.id });

  return { tiposDiaria, funcao, beneficio };
}

async function createDevTenant(
  db: NodePgDatabase,
  tenantId: string,
  email: string,
  password: string
) {
  const passwordHash = await argon2.hash(password);

  const [createdTenant] = await db
    .insert(tenant)
    .values({ id: tenantId, name: tenantId, isActive: true })
    .returning();

  const [createdUser] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      isActive: true,
    })
    .returning();

  await db.insert(tenantMemberships).values({
    tenantId: createdTenant.id,
    userId: createdUser.id,
    role: 'owner',
    isDefault: true,
  });
}

async function main() {
  const db = drizzle(process.env['DATABASE_URL']!);

  await reset(db, tables);
  await createDevTenant(
    db,
    process.env.TENANT_ID!,
    process.env.DEV_TENANT_USER_EMAIL!,
    process.env.USER_PASSWORD!
  );
  await createDevTenant(
    db,
    process.env.TENANT_2_ID!,
    process.env.DEV_TENANT_2_USER_EMAIL!,
    process.env.USER_PASSWORD!
  );
  const { tiposDiaria, funcao, beneficio } = await createLookups(db);
  await seed(db, tables).refine((f) => {
    return {
      funcionarios: {
        count: 20,
        columns: {
          nome: f.fullName(),
          social: f.valuesFromArray({ values: [''] }),
          cpf: f.phoneNumber({ template: '###.###.###-##' }),
          phone: f.phoneNumber({ template: '(47) ##### ####' }),
          funcao: f.valuesFromArray({
            values: funcao.map((funcao) => funcao.id),
          }),
        },
      },
      empresas: {
        count: 10,
        columns: {
          razao: f.companyName(),
          fantasia: f.companyName(),
          cnpj: f.phoneNumber({ template: '###.###.###-##' }),
          phone: f.phoneNumber({ template: '(47) ##### ####' }),
        },
        with: {
          projetos: [
            { weight: 0.8, count: [1, 2] },
            { weight: 0.2, count: [3, 4] },
          ],
        },
      },
      projetos: {
        columns: {
          nome: f.companyName(),
        },
        count: 1,
        with: {
          diarias: 10,
        },
      },
      diarias: {
        count: 1,
        columns: {
          tipoDiaria: f.valuesFromArray({
            values: tiposDiaria.map((tipoDiaria) => tipoDiaria.id),
          }),
        },
      },
      beneficios: {
        count: 1,
        columns: {
          id: f.valuesFromArray({
            values: beneficio.map((beneficio) => beneficio.id),
          }),
        },
      },
    };
  });
}

main();
