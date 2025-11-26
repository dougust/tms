# Plan 4 — Tenant Lifecycle Flows (Without Provisioning)

Goal: Define flows for how users and tenants interact over time: signup, invite/join, and switching current tenant for multi-tenant users. This plan explicitly excludes provisioning (schema creation/seeding), which is covered in Plan 5.

Scope: Backend and database (base schema) only.

## Database (base schema)

1. tenant_memberships

   - tenantId (uuid fk -> tenants.id)
   - userId (uuid fk -> users.id)
   - role (enum: owner | admin | member | viewer)
   - isDefault (boolean default false)
   - createdAt (timestamp, defaultNow)
   - updatedAt (timestamp, defaultNow)
   - Primary key: (tenantId, userId)
   - Indexes: by userId, by tenantId

2. invites
   - id (uuid, pk, defaultRandom)
   - tenantId (uuid fk -> tenants.id)
   - email (varchar 255, not null)
   - role (enum)
   - token (varchar 255, unique, not null)
   - expiresAt (timestamp, not null)
   - acceptedAt (timestamp, nullable)
   - createdAt (timestamp, defaultNow)

Notes:

- Use enums.userRoleEnum already present, or create a separate role enum if needed. Map differences in code if DB enum values differ.

## Backend endpoints (NestJS)

1. POST /auth/signup

   - Input: { fullName, email, password, tenantName }
   - Flow:
     - Create user (hash password)
     - Create tenant (tenants table)
     - Create membership (role=owner, isDefault=true)
     - [No provisioning here; simply return success]
     - Issue access/refresh tokens (optionally include currentTenantId in claims)

2. POST /auth/invite (owner/admin)

   - Input: { email, role }
   - Flow:
     - Create invite with token and expiry for current tenant
     - Email sending is out of scope; return token in response for dev

3. POST /auth/accept-invite

   - Input: { token, fullName?, password? }
   - Flow:
     - Validate token; load tenant and role
     - If user exists by email, use it; otherwise create a new user with provided details
     - Create membership for that user on the tenant with given role
     - Mark invite acceptedAt

4. POST /auth/switch-tenant (authenticated)
   - Input: { tenantId }
   - Flow:
     - Validate the user has membership on tenantId
     - Return a new access token embedding currentTenantId=tenantId for convenience

## Business rules

- A user can have multiple memberships (multi-tenant user)
- Exactly one membership per (tenantId, userId) tuple
- One default membership across user’s memberships (isDefault=true); maintain with transaction when flipping defaults
- Owner can transfer ownership to another member (out of scope for now, but keep in mind for future)

## Security

- All endpoints require JWT except signup and accept-invite
- Enforce rate limiting on signup and invite endpoints
- Token claims should not leak invite tokens or sensitive data

## Acceptance criteria

- Users can sign up and become owner of a new tenant (without provisioning)
- Admin/Owner can invite users; users can accept and gain membership
- Users with multiple tenants can switch their current tenant context via a token refresh or dedicated endpoint
