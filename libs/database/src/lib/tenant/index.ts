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
  uniqueIndex, foreignKey,
} from 'drizzle-orm/pg-core';
import { userRoleEnum } from '../enums';
import { relations } from 'drizzle-orm';

export const users = (tenantId: string) =>
  pgSchema(tenantId).table('users', {
      id: uuid('id').defaultRandom(),
      passwordHash: varchar('password_hash', { length: 255 }).notNull(),
      role: userRoleEnum('role').default('agent').notNull(),
      isActive: boolean('is_active').default(true),
      userName: varchar('user_name', { length: 20 }),
      login: varchar('login', { length: 255 })
        .notNull(),
      loginVerifiedAt: timestamp('login_verified_at'),
      lastLoginAt: timestamp('last_login_at'),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      pkUsers: primaryKey({
        columns: [t.id],
        name: 'pk_users',
      }),
      fkUserLogin: foreignKey({
        name: 'fk_user_login',
        columns: [t.login],
        foreignColumns: [cadastros(tenantId).email],
      })
    })
  );

export const cadastros = (tenantId: string) =>
  pgSchema(tenantId).table('cadastros', {
      id: uuid('cadastro_id').defaultRandom(),
      nomeRazao: varchar('nome_razao', { length: 100 }),
      socialFantasia: varchar('social_fantasia', { length: 100 }),
      cpfCnpj: varchar('cpf_cnpj', { length: 15 }).unique().notNull(),
      nascimentoRegistro: date('nascimento_registro'),
      phone: varchar('phone', { length: 20 }),
      email: varchar('email', { length: 255 }).unique().notNull(),
      rg: varchar('rg', { length: 11 }),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      pkCadastros: primaryKey({
        columns: [t.id],
        name: 'pk_cadastros',
      })
    })
  );

export const projetos = (tenantId: string) =>
  pgSchema(tenantId).table('projetos', {
      id: uuid('projeto_id').defaultRandom(),
      nome: varchar('nome', { length: 100 }).unique(),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      pkProjetos: primaryKey({
        columns: [t.id],
        name: 'pk_projetos',
      })
    })
  );

export const funcionarios = (tenantId: string) =>
  pgSchema(tenantId).table('funcionarios', {
      // TOOD: remove id
      id: uuid('funcionario_id').unique().notNull(),
      projetos: jsonb('projetos'),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      fkFuncionario: foreignKey({
        name: 'fk_funcionario_cadastro',
        columns: [t.id],
        foreignColumns: [cadastros(tenantId).id],
      }),
    })
  );

export const atividadesObras = (tenantId: string) =>
  pgSchema(tenantId).table(
    'atividades_obras',
    {
      id: uuid('atividade_obra_id').notNull(),
      projetoId: uuid('projeto_id').notNull(),
      data: timestamp('data').notNull(),
      observacoes: varchar('observacoes', { length: 100 }),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      pkAtividadesObras: primaryKey({
        columns: [t.id],
        name: 'pk_atividade_obra',
      }),
      fkAtividadesObrasProjeto: foreignKey({
        name: 'fk_atividades_obras_projeto',
        columns: [t.projetoId],
        foreignColumns: [projetos(tenantId).id],
      }),
      uqAtividadeObraProjetoData: uniqueIndex(
        'uq_atividades_obras_projeto_data'
      ).on(t.projetoId, t.data),
    })
  );

export const frequencia = (tenantId: string) =>
  pgSchema(tenantId).table(
    'frequencia',
    {
      id: uuid('frequencia_id').defaultRandom(),
      atividadeObraId: uuid('atividade_obra_id')
        .notNull(),
      funcionarioId: uuid('funcionario_id')
        .notNull(),
      presente: boolean('presente').notNull(),
      observacoes: varchar('observacoes', { length: 100 }),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      pkFrequencia: primaryKey({
        columns: [t.id],
        name: 'pk_frequencia',
      }),
      fkAtividadeObraId: foreignKey({
        name: 'fk_atividades_obras',
        columns: [t.atividadeObraId],
        foreignColumns: [atividadesObras(tenantId).id],
      }),
      fkFuncionarioId: foreignKey({
        name: 'fk_frequencia_funcionario',
        columns: [t.funcionarioId],
        foreignColumns: [funcionarios(tenantId).id],
      }),
      uqAtividadeFuncionario: uniqueIndex(
        'uq_frequencia_atividade_funcionario'
      ).on(t.atividadeObraId, t.funcionarioId),
    })
  );

export const projetosRelations = (tenantId: string) =>
  relations(projetos(tenantId), ({ many }) => ({
    funcionarios: many(funcionarios(tenantId)),
  }));

export const cadastrosRelations = (tenantId: string) =>
  relations(cadastros(tenantId), ({ one }) => ({
    funcionario: one(funcionarios(tenantId)),
  }));
