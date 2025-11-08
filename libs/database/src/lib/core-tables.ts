import {
  boolean,
  foreignKey,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { subscriptionTierEnum, userRoleEnum } from './enums';

// tenant table - multi-tenant tenant accounts
export const tenant = pgTable('tenants', {
  id: varchar('tenant_id', { length: 255 }).primaryKey().unique(),
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

// users table - base schema
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }),
    isActive: boolean('is_active').default(true),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [uniqueIndex('users_email_unique').on(t.email)]
);

// auth_sessions table - stores hashed refresh tokens
export const authSessions = pgTable(
  'auth_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    tokenHash: varchar('token_hash', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: varchar('ip_address', { length: 64 }),
    userAgent: varchar('user_agent', { length: 512 }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    uniqueIndex('auth_sessions_user_token_unique').on(t.userId, t.tokenHash),
    foreignKey({
      name: 'fk_auth_sessions_user',
      columns: [t.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
  ]
);

// tenant_memberships table - user membership and role within a tenant
export const tenantMemberships = pgTable(
  'tenant_memberships',
  {
    tenantId: varchar('tenant_id', { length: 255 }).notNull(),
    userId: uuid('user_id').notNull(),
    role: userRoleEnum('role').notNull().default('viewer'),
    isDefault: boolean('is_default').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => [
    primaryKey({
      name: 'pk_tenant_memberships',
      columns: [t.tenantId, t.userId],
    }),
    foreignKey({
      name: 'fk_tenant_memberships_tenant',
      columns: [t.tenantId],
      foreignColumns: [tenant.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'fk_tenant_memberships_user',
      columns: [t.userId],
      foreignColumns: [users.id],
    }).onDelete('cascade'),
  ]
);
