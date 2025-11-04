// Users table - system users (tenant owners and agents)
import {
  boolean,
  date,
  foreignKey,
  pgSchema,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { userRoleEnum } from '../enums';
import { relations } from 'drizzle-orm';
import { tipoDeDiariaEnum } from './enums';

export const users = (tenantId: string) =>
  pgSchema(tenantId).table(
    'cad_users',
    {
      id: uuid('id').defaultRandom(),
      passwordHash: varchar('password_hash', { length: 255 }).notNull(),
      role: userRoleEnum('role').default('agent').notNull(),
      isActive: boolean('is_active').default(true),
      userName: varchar('user_name', { length: 20 }),
      login: varchar('login', { length: 255 }).notNull(),
      loginVerifiedAt: timestamp('login_verified_at'),
      lastLoginAt: timestamp('last_login_at'),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => [
      primaryKey({
        columns: [t.id],
        name: 'pk_users',
      }),
      foreignKey({
        name: 'fk_user_login',
        columns: [t.login],
        foreignColumns: [empresas(tenantId).email],
      }),
    ]
  );

export const empresas = (tenantId: string) =>
  pgSchema(tenantId).table(
    'cad_empresas',
    {
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
    (t) => [
      primaryKey({
        columns: [t.id],
        name: 'pk_empresa',
      }),
    ]
  );
export const empresasRelations = (tenantId: string) =>
  relations(empresas(tenantId), ({ many }) => ({
    projetos: many(projetos(tenantId)),
  }));

export const projetos = (tenantId: string) =>
  pgSchema(tenantId).table(
    'cad_projetos',
    {
      id: uuid('projeto_id').defaultRandom(),
      empresa_id: uuid('empresa_id'),
      nome: varchar('nome', { length: 100 }).unique(),
      inicio: date('inicio').notNull(),
      fim: date('fim').notNull(),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => [
      primaryKey({
        columns: [t.id],
        name: 'pk_projetos',
      }),
      foreignKey({
        name: 'fk_projeto_empresa',
        columns: [t.empresa_id],
        foreignColumns: [empresas(tenantId).id],
      }),
    ]
  );
export const projetosRelations = (tenantId: string) =>
  relations(projetos(tenantId), ({ many, one }) => ({
    funcionarios: many(funcionarios(tenantId)),
    diarias: many(diarias(tenantId)),
  }));

export const funcionarios = (tenantId: string) =>
  pgSchema(tenantId).table(
    'cad_funcionarios',
    {
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
    (t) => [
      primaryKey({
        columns: [t.id],
        name: 'pk_funcionrio',
      }),
    ]
  );
export const funcionariosRelations = (tenantId: string) =>
  relations(diarias(tenantId), ({ many }) => ({
    diariasToFuncionarios: many(diariasToFuncionarios(tenantId)),
  }));

export const diarias = (tenantId: string) =>
  pgSchema(tenantId).table(
    'cad_diarias',
    {
      id: uuid('diarias_id').notNull(),
      projetoId: uuid('projeto_id').notNull(),
      dia: date('dia').notNull(),
      observacoes: varchar('observacoes', { length: 100 }),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => [
      primaryKey({
        columns: [t.id],
        name: 'pk_diarias',
      }),
      foreignKey({
        name: 'fk_diarias_projetos',
        columns: [t.projetoId],
        foreignColumns: [projetos(tenantId).id],
      }),
      uniqueIndex('uq_diarias_projetos_dia').on(t.projetoId, t.dia),
    ]
  );
export const diariasRelations = (tenantId: string) =>
  relations(diarias(tenantId), ({ many }) => ({
    diariasToFuncionarios: many(diariasToFuncionarios(tenantId)),
  }));

export const diariasToFuncionarios = (tenantId: string) =>
  pgSchema(tenantId).table(
    'rel_diarias_funcionarios',
    {
      funcionarioId: uuid('funcionario_id').notNull(),
      diariasId: uuid('diarias_id').notNull(),
      tipo: tipoDeDiariaEnum('tipo').notNull().default('presente'),
      observacoes: varchar('observacoes', { length: 100 }),
      createdAt: timestamp('created_at').defaultNow(),
      updatedAt: timestamp('updated_at').defaultNow(),
    },
    (t) => [
      primaryKey({
        name: 'pk_diarias_funcionarios',
        columns: [t.funcionarioId, t.diariasId],
      }),
      foreignKey({
        name: 'fk_diarias_funcionarios_diarias',
        columns: [t.diariasId],
        foreignColumns: [diarias(tenantId).id],
      }),
      foreignKey({
        name: 'fk_diarias_funcionarios_funcionarios',
        columns: [t.funcionarioId],
        foreignColumns: [funcionarios(tenantId).id],
      }),
    ]
  );
