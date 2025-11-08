import { drizzle } from 'drizzle-orm/node-postgres';
import { reset, seed } from 'drizzle-seed';
import * as schema from './lib/schema.dev';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';

async function main() {
  const db = drizzle(process.env['DATABASE_URL']);

  const password = await argon2.hash('admin123456');

  await reset(db, schema);

  // Seed base tenant matching TENANT_ID so middleware validation passes in dev
  const tenantId = process.env['TENANT_ID'];
  if (!tenantId) {
    console.warn('TENANT_ID is not set; dev seed will create tenant-scoped tables but base.tenants row will be missing.');
  } else {
    await db.insert(schema.tenant).values({ id: tenantId, name: 'Dev Tenant', isActive: true });
  }

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
    users: {
      count: 1,
      columns: {
        email: f.valuesFromArray({ values: ['admin@admin.com'] }),
        passwordHash: f.valuesFromArray({ values: [password] }),
      },
    },
  }));

  // Create membership for seeded admin user on the dev tenant
  if (tenantId) {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, 'admin@admin.com'))
      .limit(1);
    if (user) {
      await db.insert(schema.tenantMemberships).values({
        tenantId,
        userId: user.id,
        role: 'owner',
        isDefault: true,
      });
    }
  }
}

main();
