## RBAC Backend (NestJS + Prisma)

**TL;DR**: NestJS backend for **user authentication** and a **Role-Based Access Control (RBAC) foundation** using **PostgreSQL** and **Prisma ORM**.

This backend acts as the central service for:

- User management
- Role & permission (RBAC) management
- Audit logging of important actions

---

### Main Features (current)

- **Basic authentication**
  - `POST /auth/register` – register a new user.
  - `POST /auth/login` – login with email & password.
  - Passwords are hashed using **argon2** (never stored in plain text).
- **User persistence in database**
  - `User` model in `prisma/schema.prisma`:
    - `id` (UUID)
    - `email` (unique)
    - `password` (hashed)
    - `createdAt`, `updatedAt`
- **Database access via Prisma**
  - `PrismaService` extends `PrismaClient` and connects automatically on module init.
- **Health check**
  - `HealthController` (e.g. `GET /health`) to check service status.
- **RBAC module foundation**
  - Registered in `AppModule`:
    - `AuthModule`
    - `UsersModule`
    - `RolesModule`
    - `PermissionsModule`
    - `RbacModule`
    - `AuditLogModule`
    - `PrismaModule`
  - These modules are the base to implement role, permission, and audit log features.

---

### Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth & Security**:
  - `argon2` for password hashing.
  - `@nestjs/jwt` & `passport-jwt` are included as dependencies for future JWT-based auth.

---

## High-Level Architecture

- **`AppModule`**
  - Application entry point, wires all feature modules together and registers `ConfigModule` globally.
- **`AuthModule`**
  - `AuthController`:
    - `POST /auth/register`
    - `POST /auth/login`
  - `AuthService`:
    - `register(email, password)` → hash password with argon2 → store in `User` table via Prisma.
    - `login(email, password)` → find user by email → verify password with argon2 → return user (can later be changed to return JWT).
- **`PrismaModule` / `PrismaService`**
  - Shared module/service for database access across the application.
  - Extends `PrismaClient` and connects in `onModuleInit`.
- **`HealthController`**
  - For health checks (monitoring/observability), e.g. used by uptime monitoring or container orchestration.
- **`UsersModule`, `RolesModule`, `PermissionsModule`, `RbacModule`, `AuditLogModule`**
  - Planned to handle:
    - User CRUD
    - Role & permission CRUD
    - RBAC policy/guards
    - Audit logging of important actions.

---

## Setup & Configuration

### 1. Prerequisites

- Node.js (latest LTS recommended).
- PostgreSQL running locally or via container.

### 2. Install dependencies

```bash
npm install
```

### 3. Environment configuration

Create and configure the `.env` file in the project root. Minimal example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rbac_db"
```

> **Note**:  
> - Replace `password` and `rbac_db` with your local settings.  
> - This variable is used by Prisma in `prisma/schema.prisma`.

### 4. Prisma setup

Generate Prisma Client:

```bash
npx prisma generate
```

If you already have migrations, run:

```bash
npx prisma migrate dev
```

---

## Running the Application

```bash
# development
npm run start

# watch mode (commonly used during development)
npm run start:dev

# production mode (uses build in dist folder)
npm run start:prod
```

Default NestJS URL: `http://localhost:3000`.

---

## Endpoints & Example Requests

### 1. Register

- **URL**: `POST /auth/register`  
- **Body (JSON)**:

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

- **Behavior**:
  - Hash the password with argon2.
  - Store the user in the `User` table (email must be unique).

### 2. Login

- **URL**: `POST /auth/login`  
- **Body (JSON)**:

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

- **Behavior**:
  - Find user by `email`.
  - Verify the password using argon2.
  - On failure → `401 Unauthorized` with message "Invalid credentials".
  - On success → returns user data (can be extended to return JWT).

> **Next step**: integrate JWT in `AuthService` to return access tokens and protect routes using role/permission-based guards.

---

## NPM Scripts

```bash
# build TypeScript to JavaScript (dist)
npm run build

# format code with Prettier
npm run format

# linting with ESLint
npm run lint

# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

---

## Roadmap / Planned Features

- **User Management**
  - User CRUD endpoints.
  - Pagination & filtering.
- **Role Management**
  - `Role` model and relation to `User`.
  - Assign / revoke roles for users.
- **Permission Management**
  - `Permission` model and relation to `Role`.
  - Define permissions per feature/action.
- **RBAC Guard**
  - NestJS guards / custom decorators to check role/permission per endpoint.
- **Audit Log**
  - Log important events (login, role/permission changes, etc.).

---

## License

Current status: **UNLICENSED** (see `package.json`).  
Adjust if you plan to release this as open source.

