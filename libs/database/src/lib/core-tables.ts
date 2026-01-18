import {
  boolean,
  foreignKey,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(authSessions),
}));

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
export const sessionsRelations = relations(authSessions, ({ one }) => ({
  user: one(users, { fields: [authSessions.userId], references: [users.id] }),
}));
