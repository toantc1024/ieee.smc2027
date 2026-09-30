---
name: ieee-smc-security
description: Security protocol, multi-provider authentication (Google, WeChat, Email OTP/Password), environment isolation, and access control for IEEE SMC 2027.
---

# IEEE SMC 2027 Security Standard & Auth Architecture

This skill defines the security requirements, secret handling rules, and authentication workflows for the **IEEE SMC 2027** conference management platform.

---

## 1. Environment Segregation & Secret Isolation

Never expose secret keys, API tokens, or database credentials in client bundles, public repositories, or client-accessible Next.js code.

### 1.1 File Architecture
- **`.env` / `.env.local`**: Local development environment only. Must be ignored by `.gitignore`.
- **`.env.example`**: Version-controlled template containing variable names with dummy placeholders and setup instructions.
- **`.env.production.example`**: Version-controlled template containing production variables (domain `https://ieee-smc2027.org`, prod client IDs).
- **Hosting Environment Variables**: Stored in production hosting dashboard (Vercel, AWS, or Docker secret manager) and never written to repository files.

### 1.2 Mandatory Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"

# Application Base URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Or https://ieee-smc2027.org in prod

# JWT & Cryptographic Salts
JWT_SECRET="<64+ character cryptographically secure random string>"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="<client_id>.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="<google_oauth_client_secret>"

# WeChat Open Platform (微信开放平台)
WECHAT_APP_ID="<wechat_appid>"
WECHAT_APP_SECRET="<wechat_app_secret>"
WECHAT_DEV_MODE="true" # Set false in production

# Email Service (SMTP or Resend for OTP)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="<email_address>"
EMAIL_SERVER_PASSWORD="<app_password>"
EMAIL_FROM="IEEE SMC 2027 <no-reply@ieee-smc2027.org>"
EMAIL_DEV_MODE="true" # When true, OTP prints to dev console / response for instant testing

# Default Root Admin
ADMIN_INITIAL_EMAIL="admin@hcmute.edu.vn"
ADMIN_INITIAL_PASSWORD="<argon2_or_sha256_hash_or_secure_bootstrap_key>"
```

---

## 2. Multi-Provider Authentication Protocols

The platform supports 4 distinct authentication vectors:
1. **Google OAuth 2.0**
2. **WeChat Open Platform QR Connect**
3. **Email One-Time Password (OTP)**
4. **Email & Password Authentication**

### 2.1 Google OAuth 2.0 Flow
- **Initiation**: `GET /api/auth/google` generates a random CSRF `state` and redirects user to `https://accounts.google.com/o/oauth2/v2/auth`.
- **Callback**: `GET /api/auth/callback/google?code=...&state=...` exchanges the authorization code on the server side using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- **User Upsert**: Fetches user profile from `https://www.googleapis.com/oauth2/v2/userinfo`. Checks if email is in `ADMIN_EMAILS` list or already has role `ADMIN`. Upserts user with `provider: "google"`.
- **Session Issuance**: Issues signed HS256 JWT in an `httpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=604800` (7 days) cookie named `admin_session`.

### 2.2 WeChat Web QR Connect (微信扫码登录)
- **Open Platform Integration**: Requires a verified WeChat Open Platform Website Application (微信开放平台 - 网站应用).
- **Authorization URL**:
  ```text
  https://open.weixin.qq.com/connect/qrconnect?appid={WECHAT_APP_ID}&redirect_uri={ENCODED_REDIRECT_URI}&response_type=code&scope=snsapi_login&state={STATE}#wechat_redirect
  ```
- **Code Exchange**: `https://api.weixin.qq.com/sns/oauth2/access_token` returns `access_token` and `openid` / `unionid`.
- **User Profile**: `https://api.weixin.qq.com/sns/userinfo` retrieves nickname and WeChat headimgurl.
- **Local Dev Simulation**: When `WECHAT_DEV_MODE="true"`, enables testing without pending WeChat enterprise verification by using simulated QR scanning.

### 2.3 Email One-Time Password (OTP)
- **Code Generation**: 6-digit numeric code generated using cryptographically secure PRNG (`crypto.randomInt(100000, 1000000)`).
- **Storage & Expiration**: Code is stored with SHA-256 hash, 5-minute TTL (Time-to-Live), and max 5 verification attempts.
- **Delivery**:
  - In production (`EMAIL_DEV_MODE="false"`): Sent via transactional SMTP or API (Resend / SendGrid / AWS SES) with plain-text and HTML templates.
  - In development (`EMAIL_DEV_MODE="true"`): Logged to development console and returned in developer test modal.
- **Verification**: Timing-safe comparison of provided OTP hash against stored hash. On success, OTP is invalidated immediately (single-use).

### 2.4 Email & Password
- **Hashing Standard**: Passwords must be hashed using PBKDF2 (100,000+ iterations with unique salt) or Argon2id. Never store plain-text passwords.
- **Admin Accounts**: Super-admin email addresses are defined in `ADMIN_EMAILS` whitelist (`tctoan1024@gmail.com`, `admin@hcmute.edu.vn`).

---

## 3. Session & Cookie Security Standards

All authentication cookies must strictly adhere to the following flags:
```typescript
cookies().set({
  name: "admin_session",
  value: token,
  httpOnly: true,                               // Prevents XSS script access
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "lax",                              // Mitigates CSRF while allowing OAuth top-level redirects
  path: "/",
  maxAge: 60 * 60 * 24 * 7,                     // 7 days
});
```

---

## 4. Route Protection & Middleware Policy

1. **Client-Side Protection**:
   - Dashboard layouts must call `getCurrentUser()` or equivalent server session validator. Unauthenticated users are redirected to `/admin/login`.
2. **API Route Protection**:
   - Every `/api/admin/*` handler must verify `verifySessionToken()` and confirm `user.role === "ADMIN"`.
   - Return `401 Unauthorized` or `403 Forbidden` if missing or invalid.
3. **AI Agent Protection**:
   - Admin settings allow programmatic agents to interact only with read-only endpoints unless authenticated with authorized admin bearer credentials.
   - Authorized redirect URIs and origins must be verified against whitelist.

---

## 5. UI Design Guidelines: Clean shadcn Aesthetics

- **No heavy gradient boxes**: Avoid saturated rainbow or neon gradient backgrounds.
- **Shadcn Standard Palette**: Use clean neutral slates (`slate-50` to `slate-950`), crisp `border-slate-200` borders, subtle card elevations (`shadow-xs` / `shadow-sm`), and primary IEEE blue (`#115eff` / `#004776`) for active accents.
- **Tree-based Navigation**: Pages and hierarchical content must be displayed using collapsible tree nodes with clear parent-child indentation.
