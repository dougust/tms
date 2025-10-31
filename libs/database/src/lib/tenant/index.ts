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
    accessTokenEncrypted: text('access_token_encrypted').notNull(),
    webhookVerifyToken: varchar('webhook_verify_token', {
      length: 255,
    }).notNull(),
    nomeFantasia: varchar('nome_fantasia', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  });
