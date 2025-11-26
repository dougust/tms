# Plan 1 — Basic Authentication (Existing User, Existing Tenant)

Goal: Implement only what is required to authenticate (login), issue/refresh tokens, and logout an already-existing user who already belongs to an existing tenant. No signup, no SSO, no invites, no tenant provisioning.

Scope: Backend and database only.

## Database (Drizzle, base schema)

Create minimal tables needed for login/logout and refresh token rotation. Keep user–tenant relationships out of scope for this plan (handled in Plans 2–4).

1. users

   - id (uuid, pk, defaultRandom)
   - email (varchar 255, unique, not null)
   - passwordHash (varchar 255, not null)
   - fullName (varchar 255, nullable)
   - isActive (boolean, default true)
   - lastLoginAt (timestamp, nullable)
   - createdAt (timestamp, defaultNow)
   - updatedAt (timestamp, defaultNow)

2. auth_sessions (hashed refresh tokens)
   - id (uuid, pk, defaultRandom)
   - userId (uuid fk -> users.id, on delete cascade)
   - tokenHash (varchar 255, not null)
   - expiresAt (timestamp, not null)
   - ipAddress (varchar 64, nullable)
   - userAgent (varchar 512, nullable)
   - createdAt (timestamp, defaultNow)
   - updatedAt (timestamp, defaultNow)
   - unique index on (userId, tokenHash)

Notes:

- No SSO tables, no invites, no tenant_memberships in this plan.
- Email verification/MFA are out of scope here (fields can be added later without breaking functionality).

## Backend (NestJS in apps/be)

### Recommended libraries

- @nestjs/jwt — JWT issue/verify for access tokens
- @nestjs/passport + passport-local — optional, but convenient for a LocalStrategy
- argon2 — for password hashing/verification (argon2id)
- class-validator / class-transformer — DTO input validation

### Module structure

- AuthModule
  - Strategies
    - LocalStrategy (email + password)
    - JwtStrategy (access token) — required to protect endpoints, though only auth endpoints are in scope now
  - Services
    - UsersService
      - findByEmail(email): Promise<User | null>
      - verifyPassword(user, plaintext): Promise<boolean>
      - updateLastLogin(userId, date)
    - SessionsService
      - create(userId, refreshTokenHash, expiresAt, meta)
      - revoke(sessionId)
      - revokeAllForUser(userId)
      - rotate(oldToken, newTokenHash)
      - findByUserAndHash(userId, tokenHash)
    - AuthService
      - validateUser(email, password)
      - login(userId): issues access + refresh tokens; persists session
      - refresh(userId, refreshToken): validate/rotate and re-issue tokens
      - logout(userId, refreshToken or sessionId)
  - Controllers
    - POST /auth/login { email, password }
      - On success: { accessToken, refreshToken, user: { id, email, fullName } }
    - POST /auth/refresh { refreshToken }
      - On success: returns new pair (rotated): { accessToken, refreshToken }
    - POST /auth/logout { refreshToken } or Authorization header with access (server revokes the corresponding session)
      - On success: 204 No Content

### Token strategy

- Access Token (JWT)
  - Claims: sub (userId), email, iat, exp
  - TTL: 15 minutes (configurable: JWT_ACCESS_TOKEN_TTL)
- Refresh Token (opaque random string)
  - Store only a hash in auth_sessions (argon2 hash is fine)
  - TTL: 7–30 days (configurable: JWT_REFRESH_TOKEN_TTL)
  - Rotate on refresh; revoke on logout

### Security

- Hash passwords with argon2id (sensible parameters)
- Rate limit login endpoint
- Return uniform error messages for invalid credentials

### Configuration

- JWT_SECRET
- JWT_ACCESS_TOKEN_TTL (e.g., 15m)
- JWT_REFRESH_TOKEN_TTL (e.g., 30d)

### DTOs

- LoginDto: { email: string; password: string }
- RefreshDto: { refreshToken: string }
- LogoutDto: { refreshToken?: string }

### Acceptance criteria

- Can log in an existing active user and get access/refresh tokens
- Can refresh tokens (old refresh invalidated or marked used)
- Can logout (session revoked)
- Passwords are securely hashed and never logged/returned
- No dependency on tenant resolution or RBAC yet
