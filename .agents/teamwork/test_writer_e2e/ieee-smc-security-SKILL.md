---
name: ieee-smc-security
description: Security protocol, multi-provider authentication (Google OAuth, Email OTP, Password), MinIO storage security, environment isolation, and access control for IEEE SMC 2027.
---

# IEEE SMC 2027 Security Standard & Auth Architecture

This skill defines the security requirements, secret handling rules, storage isolation, and authentication workflows for the **IEEE SMC 2027** conference management platform.

---

## 1. Environment Segregation & Secret Isolation

Never expose secret keys, API tokens, MinIO secret keys, or database credentials in client bundles, public repositories, or client-accessible Next.js code.

### 1.1 File Architecture
- **`.env` / `.env.local`**: Active local environment file. Must be ignored by `.gitignore`.
- **`.env.example`**: Version-controlled base template containing all required variable names.
- **`.env.development.example`**: Version-controlled development environment template (local MinIO, dev OTP mode).
- **`.env.production.example`**: Version-controlled production environment template (`https://ieee-smc2027.org`, production database, S3/MinIO TLS, production SMTP).

### 1.2 Mandatory Environment Variables
```bash
# [1] Runtime & Application
NODE_ENV="development"
APP_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# [2] Database (Prisma ORM + PostgreSQL)
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"

# [3] Authentication & Security
JWT_SECRET="<64+ character cryptographically secure random string>"
SESSION_COOKIE_NAME="admin_session"
ADMIN_INITIAL_EMAIL="admin@hcmute.edu.vn"
ADMIN_INITIAL_PASSWORD="<secure_bootstrap_password>"
GOOGLE_CLIENT_ID="<client_id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<google_oauth_client_secret>"

# [4] MinIO File Storage
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin123"
MINIO_BUCKET="ieee-smc-2027"
MINIO_REGION="ap-southeast-1"
MINIO_PUBLIC_URL="http://localhost:9000/ieee-smc-2027"

# [5] Email Service (SMTP for OTP & Broadcasts)
EMAIL_DEV_MODE="true"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="<email_address>"
EMAIL_SERVER_PASSWORD="<app_password>"
EMAIL_FROM="IEEE SMC 2027 <no-reply@ieee-smc2027.org>"
```

---

## 2. Multi-Provider Authentication Protocols

The platform supports 3 distinct authentication vectors:
1. **Google OAuth 2.0**
2. **Email One-Time Password (OTP)**
3. **Email & Password Authentication**

> **China Firewall Compliance**: Delegate portal and registration authentication prioritize Email OTP and Email/Password so Chinese and international delegates can log in without depending on Google services.

### 2.1 Google OAuth 2.0 Flow
- **Initiation**: `GET /api/auth/google` generates a random CSRF `state` and redirects user to `https://accounts.google.com/o/oauth2/v2/auth`.
- **Callback**: `GET /api/auth/callback/google?code=...&state=...` exchanges the authorization code on the server side using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- **User Upsert**: Fetches user profile from `https://www.googleapis.com/oauth2/v2/userinfo`. Checks if email is in `ADMIN_EMAILS` list or already has role `ADMIN`. Upserts user with `provider: "google"`.
- **Session Issuance**: Issues signed HS256 JWT in an `httpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=604800` (7 days) cookie named `admin_session`.

### 2.2 Email One-Time Password (OTP)
- **Code Generation**: 6-digit numeric code generated using cryptographically secure PRNG (`crypto.randomInt(100000, 1000000)`).
- **Storage & Expiration**: Code is stored with SHA-256 hash, 5-minute TTL, and max 5 verification attempts.
- **Delivery**:
  - In production (`EMAIL_DEV_MODE="false"`): Sent via transactional SMTP with plain-text and HTML templates.
  - In development (`EMAIL_DEV_MODE="true"`): Logged to development console and returned in developer test hint.
- **Verification**: Timing-safe comparison of provided OTP hash against stored hash. On success, OTP is invalidated immediately.

### 2.3 Email & Password
- **Hashing Standard**: Passwords must be hashed using PBKDF2 (100,000+ iterations with unique salt). Never store plain-text passwords.
- **Admin Accounts**: Super-admin email addresses are defined in `ADMIN_EMAILS` whitelist (`tctoan1024@gmail.com`, `admin@hcmute.edu.vn`).

---

## 3. Session & Cookie Security Standards

All authentication cookies must strictly adhere to the following flags:
```typescript
cookies().set({
  name: "admin_session",
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});
```

---

## 4. Route Protection & Middleware Policy

1. **Client-Side Protection**:
   - Dashboard layouts must call `getCurrentUser()` or equivalent server session validator. Unauthenticated users are redirected to `/admin/login`.
2. **API Route Protection**:
   - Every `/api/admin/*` handler must verify `verifySessionToken()` and confirm `user.role === "ADMIN"`.
   - Return `401 Unauthorized` or `403 Forbidden` if missing or invalid.
