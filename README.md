## RBAC Backend (NestJS + Prisma)

**TL;DR**: Backend NestJS untuk **autentikasi user** dan **fondasi Role-Based Access Control (RBAC)** menggunakan **PostgreSQL** dan **Prisma ORM**.

Backend ini akan menjadi pusat:

- Manajemen user.
- Manajemen role & permission (RBAC).
- Audit log aktivitas penting.

---

### Fitur Utama (saat ini)

- **Autentikasi dasar**
  - `POST /auth/register` – registrasi user baru.
  - `POST /auth/login` – login dengan email & password.
  - Password di-hash menggunakan **argon2** (bukan plain text).
- **Persistensi user di database**
  - Model `User` di `prisma/schema.prisma`:
    - `id` (UUID)
    - `email` (unik)
    - `password` (hashed)
    - `createdAt`, `updatedAt`
- **Koneksi database dengan Prisma**
  - `PrismaService` meng-extend `PrismaClient` dan auto connect saat module init.
- **Health check**
  - `HealthController` (misalnya endpoint `GET /health`) untuk cek status service.
- **Fondasi modul RBAC**
  - Di `AppModule` sudah terdaftar:
    - `AuthModule`
    - `UsersModule`
    - `RolesModule`
    - `PermissionsModule`
    - `RbacModule`
    - `AuditLogModule`
    - `PrismaModule`
  - Modul-modul ini akan diisi untuk mengatur role, permission, dan audit log.

---

### Stack Teknologi

- **Runtime**: Node.js
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth & Security**:
  - `argon2` untuk hashing password.
  - `@nestjs/jwt` & `passport-jwt` sudah disiapkan di dependency untuk JWT-based auth (bisa dikembangkan).

---

## Arsitektur Singkat

- **`AppModule`**
  - Entry point aplikasi, menggabungkan semua module feature.
- **`AuthModule`**
  - `AuthController`:
    - `POST /auth/register`
    - `POST /auth/login`
  - `AuthService`:
    - `register(email, password)` → hash password → simpan ke tabel `User`.
    - `login(email, password)` → cek user by email → verifikasi password argon2 → return user (bisa dikembangkan jadi return JWT).
- **`PrismaModule` / `PrismaService`**
  - Shared module untuk akses database di seluruh aplikasi.
- **`HealthController`**
  - Untuk health check service (monitoring/observability).
- **`UsersModule`, `RolesModule`, `PermissionsModule`, `RbacModule`, `AuditLogModule`**
  - Disiapkan sebagai pondasi untuk:
    - CRUD user.
    - CRUD role & permission.
    - Mekanisme RBAC (policy/guard).
    - Audit log aktivitas penting.

---

## Setup & Konfigurasi

### 1. Prasyarat

- Node.js (versi terbaru LTS direkomendasikan).
- PostgreSQL berjalan secara lokal atau via container.

### 2. Install dependency

```bash
npm install
```

### 3. Konfigurasi environment

Atur file `.env` di root project. Contoh minimal:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/rbac_db"
```

> **Catatan**:  
> - Ganti `password` dan `rbac_db` sesuai setting lokal.  
> - Variabel ini digunakan Prisma di `prisma/schema.prisma`.

### 4. Prisma setup

Generate Prisma Client:

```bash
npx prisma generate
```

Jika sudah menyiapkan migration, jalankan:

```bash
npx prisma migrate dev
```

---

## Menjalankan Aplikasi

```bash
# development
npm run start

# watch mode (paling umum dipakai saat dev)
npm run start:dev

# production mode (menggunakan build di folder dist)
npm run start:prod
```

Default NestJS: `http://localhost:3000`.

---

## Endpoint & Contoh Request

### 1. Register

- **URL**: `POST /auth/register`  
- **Body (JSON)**:

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

- **Perilaku**:
  - Hash password dengan argon2.
  - Simpan user ke tabel `User` (email harus unik).

### 2. Login

- **URL**: `POST /auth/login`  
- **Body (JSON)**:

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

- **Perilaku**:
  - Cari user berdasarkan `email`.
  - Verifikasi password menggunakan argon2.
  - Jika gagal → `401 Unauthorized` dengan pesan "Invalid credentials".
  - Jika sukses → mengembalikan data user (bisa dikembangkan untuk mengembalikan JWT).

> **Next step**: integrasi JWT di `AuthService` untuk mengembalikan access token, dan guard route berbasis role/permission.

---

## Skrip NPM

```bash
# build TypeScript ke JavaScript (dist)
npm run build

# format code dengan Prettier
npm run format

# linting dengan ESLint
npm run lint

# unit tests
npm run test

# e2e tests
npm run test:e2e

# coverage
npm run test:cov
```

---

## Roadmap / Rencana Pengembangan

- **User Management**
  - Endpoint CRUD user.
  - Pagination & filtering.
- **Role Management**
  - Model `Role`, relasi ke `User`.
  - Assign / revoke role ke user.
- **Permission Management**
  - Model `Permission`, relasi ke `Role`.
  - Definisi permission per fitur/aksi.
- **RBAC Guard**
  - Guard/custom decorator di NestJS untuk cek role/permission per endpoint.
- **Audit Log**
  - Pencatatan event penting (login, perubahan role/permission, dll).

---

## Lisensi

Status saat ini: **UNLICENSED** (lihat `package.json`).  
Silakan disesuaikan jika ingin dipublikasikan sebagai open source.
