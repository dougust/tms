import {
  boolean,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { subscriptionTierEnum, userRoleEnum } from './enums';

// tenant table - multi-tenant tenant accounts
export const tenant = pgTable('tenantes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 500 }),
  addressLine1: varchar('address_line1', { length: 255 }),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 2 }).default('US'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  logoUrl: varchar('logo_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  subscriptionTier:
    subscriptionTierEnum('subscription_tier').default('starter'),
  trialEndsAt: timestamp('trial_ends_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Users table - system users (tenant owners and agents)
export const users = pgTable('users', {
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
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenant.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pessoasJuridicas = pgTable(
  'pessoas_juridicas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenant.id, { onDelete: 'cascade' }),
    cnpj: varchar('cnpj', {
      length: 50,
    }).notNull(),
    accessTokenEncrypted: text('access_token_encrypted').notNull(),
    webhookVerifyToken: varchar('webhook_verify_token', {
      length: 255,
    }).notNull(),
    nomeFantasia: varchar('nome_fantasia', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    // Unique constraint on phone_number + tenant_id
    cnpjUnicoPorEmpresa: unique().on(table.cnpj, table.tenantId),
  })
);

// Relations
export const tenantsRelations = relations(tenant, ({ many }) => ({
  users: many(users),
  pessoasJuridicas: many(pessoasJuridicas),
}));
