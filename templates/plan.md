# Implementation Plans (Split)

This repository splits the work into five focused plan documents. Start here, then open each plan:

1. Basic Authentication — templates/plan.1-basic-auth.md
   - Login, refresh, logout for existing users in existing tenants. No signup, no SSO.
2. Multi-tenant Request Resolution and Enforcement — templates/plan.2-tenant-resolution.md
   - Resolve tenant per request and enforce membership.
3. Authorization (RBAC) — templates/plan.3-rbac.md
   - Code-based roles/permissions and guards.
4. Tenant Lifecycle Flows — templates/plan.4-tenant-lifecycle.md
   - Signup, invite/join, switch tenant. No provisioning.
5. Tenant Provisioning — templates/plan.5-tenant-provisioning.md
   - Create per-tenant schemas/tables and seed defaults.

Notes:

- Backend and database only. Frontend out of scope.
- No SSO in these plans.
- Provisioning is deliberately separate.

---

# Implementation Plan

Plan to implement authentication and authorization for a multi-tenant SaaS with one base schema (shared tables) and per-tenant schemas (isolated business data). The scope is backend and database only.

## Plan

1. Database: Base schema additions (Drizzle + migrations)

   - Create users table (base schema)
     - id (uuid, pk, defaultRandom)
     - email (varchar 255, unique, not null)
     - passwordHash (varchar 255, nullable for SSO)
     - fullName (varchar 255)
     - isActive (boolean, default true)
     - emailVerifiedAt (timestamp, nullable)
     - mfaEnabled (boolean, default false)
     - mfaSecret (varchar 255, nullable)
     - lastLoginAt (timestamp)
     - createdAt/updatedAt (timestamp defaultNow)
   - Create auth_sessions table (base schema) for refresh tokens
     - id (uuid, pk)
     - userId (uuid fk -> users.id, on delete cascade)
     - tokenHash (varchar 255, hashed refresh token)
     - expiresAt (timestamp not null)
     - ipAddress (varchar 64), userAgent (varchar 512)
     - createdAt/updatedAt
     - unique index on (userId, tokenHash)
   - Create user_identities table (optional, base schema) for OAuth/SSO
     - id (uuid, pk)
     - userId (fk -> users.id)
     - provider (varchar 50)
     - providerUserId (varchar 255)
     - accessToken/refreshToken (varchar, nullable)
     - unique index (provider, providerUserId)
   - Create tenant_memberships table (base schema)
     - userId (uuid fk -> users.id)
     - tenantId (uuid fk -> tenants.id)
     - role (enum: owner | admin | member | viewer)
     - isDefault (boolean default false)
     - createdAt/updatedAt
     - composite primary key (tenantId, userId)
     - index on (userId), (tenantId)
   - Create invites table (base schema)
     - id (uuid, pk)
     - tenantId (fk -> tenants.id)
     - email (varchar 255)
     - role (enum)
     - token (varchar 255, unique)
     - expiresAt (timestamp)
     - acceptedAt (timestamp)
     - createdAt
   - Add enums.ts: roleEnum('role') with values owner, admin, member, viewer
   - Drizzle migrations: forward and down scripts to create/drop the above.

2. Database: Per-tenant schema provisioning

   - Standardize tenant schema name: use tenants.id as schema (already supported via libs/database/src/lib/tenant). Ensure naming is safe (UUIDs are valid identifiers when quoted; alternatively use t\_<shortid>). Keep using id as schema name for simplicity.
   - Implement a provisioning service that:
     - Creates schema if not exists for a given tenantId.
     - Creates tenant tables using existing factory functions in libs/database/src/lib/tenant (empresas, projetos, funcionarios, diarias, tiposDiaria).
     - Seeds baseline tenant data (e.g., default tiposDiaria rows) when a schema is created.
   - Record provisioning status in tenants table (add provisionedAt timestamp) or keep it implicit by trying CREATE SCHEMA IF NOT EXISTS on every boot.

3. Backend: Auth module (NestJS - apps/be)

   - Create AuthModule with:
     - LocalStrategy (email + password) using Passport
     - JwtStrategy for access tokens (short-lived, e.g., 15m)
     - JwtRefreshStrategy for refresh tokens (long-lived, e.g., 7–30 days)
     - Argon2id for password hashing
   - Services:
     - UsersService (CRUD, findByEmail, create, setPassword, verifyPassword)
     - SessionsService (create/rotate refresh tokens, hash storage, revoke by id/user, revoke all)
     - AuthService (signup, login, refresh, logout, invite, acceptInvite, verifyEmail, requestPasswordReset, resetPassword)
   - Controllers:
     - POST /auth/signup (creates tenant + owner membership + provisions tenant schema)
     - POST /auth/login
     - POST /auth/refresh
     - POST /auth/logout
     - POST /auth/invite (tenant admin/owner)
     - POST /auth/accept-invite
     - POST /auth/verify-email, POST /auth/request-password-reset, POST /auth/reset-password

4. Backend: Multi-tenant request resolution and enforcement

   - Add TenantResolverMiddleware
     - Resolves tenant from subdomain (e.g., acme.example.com -> acme) or header X-Tenant-Id for non-subdomain environments.
     - Looks up tenant in base schema by domain slug or id and attaches tenantId to request.
   - Add TenantContext provider (scoped) that exposes getTenantId() and ensures it is present for tenant-scoped endpoints.
   - Add TenantGuard that:
     - Requires a valid JWT
     - Verifies user membership for request.tenantId
     - Loads role for the membership and attaches to request/user context
   - Drizzle dynamic schema access:
     - Create DatabaseTenantFactory that, given a tenantId, returns the tenant-scoped table objects from libs/database/src/lib/tenant (empresas(tenantId), etc.).
     - Repositories/services that operate on tenant data must obtain the tables via this factory using TenantContext.getTenantId().
     - Keep schema.dev.ts for local single-tenant/dev convenience.

5. Backend: Authorization (RBAC)

   - Define Role -> Permissions mapping in code (policy-based guard):
     - owner: all permissions within tenant, including members and billing
     - admin: manage tenant settings and all business data; cannot delete tenant
     - member: CRUD business data; cannot manage members/settings
     - viewer: read-only business data
   - Create @Roles(...actions) decorator and RolesGuard that checks the mapped permissions against request.user.role for the current tenant.
   - Optionally integrate CASL later; initial implementation uses code-based RBAC to minimize complexity.

6. Tenant lifecycle flows

   - Signup flow (no existing user):
     - Create user (base schema) with hashed password
     - Create tenant (tenants table)
     - Create tenant_membership as owner and set isDefault = true
     - Provision tenant schema and seed defaults
     - Issue access + refresh tokens; include default currentTenantId in JWT claims
   - Join existing tenant via invite:
     - Create user if new, otherwise link existing user
     - Add membership with invited role
     - Do not re-provision schema (already exists)
   - Switching tenants (for multi-tenant users):
     - Endpoint to switch current tenant: validates membership and returns new access token with that tenantId claim.

7. Tokens and claims

   - Access token (JWT) claims: sub (userId), email, currentTenantId, roles (map of tenantId -> role or just current role), iat, exp
   - Refresh token: opaque random string; store only hash in auth_sessions. Rotate on use (detect reuse). Bind to userId and optionally to tenantId for UX, but generally tenant-agnostic.

8. Security hardening

   - Password hashing: argon2id with secure params
   - Rate limiting on login and sensitive endpoints
   - Account lockout after N failed attempts with exponential backoff
   - Enforce email verification before granting elevated operations (configurable)
   - Optional MFA at later phase (table fields are present)

9. Migrations and seeding

   - Add Drizzle schema definitions for new base tables and enums in libs/database
   - Generate Drizzle migrations to create them
   - Add a lightweight SeedService for dev that creates a sample tenant and user

10. Testing

- Unit tests for AuthService, Jwt strategies, TenantGuard, RolesGuard
- E2E tests for signup -> login -> CRUD sample tenant data via empresas/projetos with tenant isolation

11. Observability and auditing (backend only)

- Add structured logs for auth events (login, logout, token refresh, invite)
- Optionally add audit_logs table in base schema for critical admin actions (owner/admin)

12. Configuration

- New env vars:
  - JWT_ACCESS_TOKEN_TTL, JWT_REFRESH_TOKEN_TTL
  - JWT_SECRET, JWT_REFRESH_SECRET (or single secret with separate audiences)
  - PASSWORD_HASH_MEMORY/COST if needed
  - TENANT_DOMAIN_MODE=domain|header; TENANT_HEADER_NAME=X-Tenant-Id

## Decisions

- Decision: Use JWT (access + refresh) with Argon2id and hashed refresh tokens stored in auth_sessions

  - Alternatives: Stateless JWT only (no refresh) or session cookies with server-side store
  - Rationale: Mobile/SPA-friendly, scalable horizontally, and hashed storage protects in case of DB leak. Rotation mitigates theft.

- Decision: Code-based RBAC (owner/admin/member/viewer) enforced via Nest guards

  - Alternatives: Database-driven permissions table; CASL/OPA based fine-grained ABAC
  - Rationale: Simpler initial implementation; can evolve to policy engine later without breaking APIs.

- Decision: Per-tenant isolation via PostgreSQL schemas selected per request and Drizzle table factories
  - Alternatives: Single schema with tenant_id on every table and RLS; separate databases per tenant
  - Rationale: Project already models per-tenant schemas via libs/database/src/lib/tenant. Continue this path for strong isolation and simpler queries; RLS remains an optional enhancement for shared base tables.

## Notes

- The base tenants table already exists. We'll add roleEnum in libs/database/src/lib/enums.ts and new base tables under libs/database.
- apps/be appears to be the NestJS backend in this repo; expose auth routes from there.
- Keep libs/database/src/lib/schema.dev.ts for local development where TENANT_ID is fixed; production uses TenantResolver + DatabaseTenantFactory.
- Provisioning must be idempotent: always use CREATE SCHEMA IF NOT EXISTS and create tables if missing.
- Consider adding a tenants.domains table or columns (primaryDomain, subdomain) to support subdomain resolution.
- Email delivery (verification, invites, reset password) is out of scope for this task but endpoints should emit tokens and allow no-op in dev.
- No frontend changes in this plan; clients will use the REST endpoints and include either subdomain or X-Tenant-Id header accordingly.
