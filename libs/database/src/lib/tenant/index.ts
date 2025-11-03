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
  pgSchema(tenantId).table('cad_users', {
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
        foreignColumns: [empresas(tenantId).email],
      })
    })
  );

export const empresas = (tenantId: string) =>
  pgSchema(tenantId).table('cad_empresas', {
      id: uuid('empresa_id').defaultRandom(),
      razao: varchar('razao', { length: 100 }),
      fantasia: varchar('fantasia', { length: 100 }),
      cnpj: varchar('cnpj', { length: 15 }).unique().notNull(),
      registro: date('registro'),
      phone: varchar('phone', { length: 20 }),
      email: varchar('email', { length: 255 }).unique().notNull(),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      pkEmpresas: primaryKey({
        columns: [t.id],
        name: 'pk_empresa',
      })
    })
  );

export const projetos = (tenantId: string) =>
  pgSchema(tenantId).table('cad_projetos', {
      id: uuid('projeto_id').defaultRandom(),
      empresa_id: uuid('empresa_id').unique(),
      nome: varchar('nome', { length: 100 }).unique(),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      pkProjetos: primaryKey({
        columns: [t.id],
        name: 'pk_projetos',
      }),
      fkProjeto: foreignKey({
        name: 'fk_projeto_empresa',
        columns: [t.empresa_id],
        foreignColumns: [empresas(tenantId).id],
      }),
    })
  );

export const funcionarios = (tenantId: string) =>
  pgSchema(tenantId).table('cad_funcionarios', {
      id: uuid('funcionario_id').defaultRandom(),
      nome: varchar('nome', { length: 100 }),
      social: varchar('social', { length: 100 }),
      cpf: varchar('cpf', { length: 15 }).unique().notNull(),
      nascimento: date('nascimento'),
      phone: varchar('phone', { length: 20 }),
      email: varchar('email', { length: 255 }).unique().notNull(),
      rg: varchar('rg', { length: 11 }),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => ({
      pkEmpresas: primaryKey({
        columns: [t.id],
        name: 'pk_funcionrio',
      })
    })
  );

export const diariaObras = (tenantId: string) =>
  pgSchema(tenantId).table(
    'rel_atividades_obras',
    {
      id: uuid('diaria_obra_id').notNull(),
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
    'rel_frequencia',
    {
      id: uuid('frequencia_id').defaultRandom(),
      diariaObraId: uuid('diaria_obra_id')
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
        columns: [t.diariaObraId],
        foreignColumns: [diariaObras(tenantId).id],
      }),
      fkFuncionarioId: foreignKey({
        name: 'fk_frequencia_funcionario',
        columns: [t.funcionarioId],
        foreignColumns: [funcionarios(tenantId).id],
      }),
      uqAtividadeFuncionario: uniqueIndex(
        'uq_frequencia_atividade_funcionario'
      ).on(t.diariaObraId, t.funcionarioId),
    })
  );

export const projetosRelations = (tenantId: string) =>
  relations(projetos(tenantId), ({ many }) => ({
    funcionarios: many(funcionarios(tenantId)),
  }));

export const empresasRelations = (tenantId: string) =>
  relations(empresas(tenantId), ({ many }) => ({
    projetos: many(projetos(tenantId)),
  }));

