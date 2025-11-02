// Users table - system users (tenant owners and agents)
import {
  boolean,
  pgSchema,
  timestamp,
  uuid,
  varchar,
  integer,
  date,
  jsonb,
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { userRoleEnum } from '../enums';
import { relations } from 'drizzle-orm';

export const users = (tenantId: string) =>
  pgSchema(tenantId).table('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').default('agent').notNull(),
    isActive: boolean('is_active').default(true),
    userName: varchar('user_name', { length: 20 }),
    login: varchar('login', { length: 255 })
      .notNull()
      .references(() => cadastros(tenantId).email),
    loginVerifiedAt: timestamp('login_verified_at'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

export const cadastros = (tenantId: string) =>
  pgSchema(tenantId).table('cadastros', {
    cadastroId: integer('cadastro_id').primaryKey().notNull(),
    nomeRazao: varchar('nome_razao', { length: 100 }),
    socialFantasia: varchar('social_fantasia', { length: 100 }),
    cpfCnpj: varchar('cpf_cnpj', { length: 15 }).unique().notNull(),
    nascimentoRegistro: date('nascimento_registro'),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 255 }).unique().notNull(),
    rg: varchar('rg', { length: 11 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

export const projetos = (tenantId: string) =>
  pgSchema(tenantId).table('projetos', {
    projetoId: integer('projeto_id')
      .primaryKey()
      .notNull()
      .references(() => cadastros(tenantId).cadastroId),
    nome: varchar('nome', { length: 100 }).unique(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

export const funcionarios = (tenantId: string) =>
  pgSchema(tenantId).table('funcionarios', {
    funcionarioId: integer('funcionario_id')
      .primaryKey()
      .notNull()
      .references(() => cadastros(tenantId).cadastroId),
    projetos: jsonb('projetos'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

export const atividadesObras = (tenantId: string) =>
  pgSchema(tenantId).table(
    'atividades_obras',
    {
      atividadeObraId: integer('atividadeobra_id').primaryKey().notNull(),
      projetoId: integer('projeto_id')
        .notNull()
        .references(() => projetos(tenantId).projetoId),
      data: timestamp('data').notNull(),
      observacoes: varchar('observacoes', { length: 100 }),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      uqAtividadeObraProjetoData: uniqueIndex(
        'uq_atividades_obras_projeto_data',
      ).on(t.projetoId, t.data),
    }),
  );

export const frequencia = (tenantId: string) =>
  pgSchema(tenantId).table(
    'frequencia',
    {
      frequenciaId: integer('frequencia_id').notNull(),
      atividadeObraId: integer('atividadeobra_id')
        .notNull()
        .references(() => atividadesObras(tenantId).atividadeObraId),
      funcionarioId: integer('funcionario_id')
        .notNull()
        .references(() => funcionarios(tenantId).funcionarioId),
      presente: boolean('presente').notNull(),
      observacoes: varchar('observacoes', { length: 100 }),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      pkFrequencia: primaryKey({
        columns: [t.frequenciaId],
        name: 'pk_frequencia',
      }),
      uqAtividadeFuncionario: uniqueIndex(
        'uq_frequencia_atividade_funcionario',
      ).on(t.atividadeObraId, t.funcionarioId),
    }),
  );

export const projetosRelations = (tenantId: string) =>
  relations(projetos(tenantId), ({ many }) => ({
    funcionarios: many(funcionarios(tenantId)),
  }));
