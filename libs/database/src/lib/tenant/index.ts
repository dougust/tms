// Users table - system users (tenant owners and agents)
import {
  boolean,
  pgSchema,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { userRoleEnum } from '../enums';
import { relations } from 'drizzle-orm';

export const users = (tenantId: string) =>
  pgSchema(tenantId).table('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    avatarUrl: varchar('avatar_url', { length: 500 }),
    role: userRoleEnum('role').default('agent').notNull(),
    isActive: boolean('is_active').default(true),
    emailVerifiedAt: timestamp('email_verified_at'),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

export const pessoasJuridicas = (tenantId: string) =>
  pgSchema(tenantId).table('pessoas_juridicas', {
    id: uuid('id').primaryKey().defaultRandom(),
    cnpj: varchar('cnpj', {
      length: 50,
    })
      .notNull()
      .unique(),
    nomeFantasia: varchar('nome_fantasia', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

export const funcionarios = (tenantId: string) =>
  pgSchema(tenantId).table('funcionarios', {
    id: uuid('id').primaryKey().defaultRandom(),
    // TODO: CPF Validation?
    cpf: varchar('cpf', {
      length: 12,
    })
      .notNull()
      .unique(),
    projetoId: uuid('projetos_id')
      .notNull()
      .references(() => projetos(tenantId).id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

export const projetos = (tenantId: string) =>
  pgSchema(tenantId).table('projetos', {
    id: uuid('id').primaryKey().defaultRandom(),
    nome: varchar('nome', { length: 255 }).notNull(),
    descricao: text('descricao'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });

export const projetosRelations = (tenantId: string) =>
  relations(projetos(tenantId), ({ many }) => ({
    funcionarios: many(funcionarios(tenantId)),
  }));
