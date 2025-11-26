# Plan 5 — Tenant Provisioning

Goal: Provision per-tenant database schema and tables when a tenant is created, and seed baseline data. Ensure idempotent operations and safe re-runs.

Scope: Backend service code and database operations. No UI.

## Approach

- Continue with existing per-tenant schema strategy implemented in libs/database/src/lib/tenant
- Schema name equals tenant.id (UUID) or sanitized slug; prefer tenant.id to avoid collisions and because factory signatures already accept tenantId
- Provisioning is idempotent and safe to call multiple times

## Tasks

1. ProvisioningService (NestJS)

   - createSchemaIfNotExists(tenantId)
     - Executes CREATE SCHEMA IF NOT EXISTS "{tenantId}"
   - createTables(tenantId)
     - Uses the factories in libs/database/src/lib/tenant to materialize tables for that schema via Drizzle migrations or programmatic checks
     - If relying on migrations, generate a migration pattern parametrized by schema (or execute DDL per schema on demand)
   - seedDefaults(tenantId)
     - Insert baseline data (e.g., tiposDiaria defaults) iff not present
   - provision(tenantId)
     - Orchestrates the three steps above within a transaction where possible

2. Idempotency & safety

   - Use IF NOT EXISTS in CREATE SCHEMA and CREATE TABLE statements when available
   - Prior to seeding, check for existing rows by unique keys

3. Observability

   - Log provisioning start/end, schema name, and any errors
   - Expose metrics (counter for schemas provisioned, failures)

4. Operational interfaces

   - CLI command or admin-only endpoint: POST /ops/provision/{tenantId}
   - Background job capable (e.g., re-provision on boot for tenants missing schema)

5. Failure handling
   - Partial failures should be retriable; use idempotent steps and clean logging

## Acceptance criteria

- Given a tenantId, running provision(tenantId) results in a usable schema with required tables
- Running provision(tenantId) multiple times does not error and does not duplicate seed data
- Admin endpoint can trigger provisioning on demand
