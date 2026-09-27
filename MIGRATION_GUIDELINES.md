# IEEE SMC 2027 — Database & Migration Guidelines

> **Production Standard**: All schema changes and database migrations must follow this versioned, reproducible process. Ad-hoc, untracked changes are strictly forbidden in production.

---

## 1. Database Architecture & Technology Stack

- **ORM**: Prisma Client v6 (`@prisma/client`, `prisma`)
- **Database Engine**: Neon Serverless PostgreSQL
- **Schema Definition**: `prisma/schema.prisma`
- **Seeding Entrypoint**: `prisma/seed.ts`
- **Connection Configuration**: Managed via `DATABASE_URL` in `.env` (with `sslmode=require`)

---

## 2. Core Data Models & Roles

### 2.1 Enums
- **`Role`**: Strictly limited to `ADMIN` and `USER`.
  - `ADMIN`: Full access to CMS, Pages Editor, Posts Editor, and User Management.
  - `USER`: Read-only / Participant access.
- **`PostStatus`**: `DRAFT`, `PUBLISHED`, `ARCHIVED`.

### 2.2 Models
1. **`User` (`users`)**:
   - `id`: Unique identifier (UUID or provider ID).
   - `email`: Unique email index.
   - `name`: User's full name.
   - `avatar`: URL to avatar image.
   - `role`: Role enum (`ADMIN` / `USER`).
   - `provider`: Authentication provider (`google`, `dev_mock`, `credentials`).
   - `createdAt`, `updatedAt`: Timestamps.

2. **`Post` (`posts`)**:
   - `id`: Unique identifier.
   - `slug`: URL slug (unique).
   - `title`, `summary`, `content` (Rich HTML/Tiptap text).
   - `coverImage`: Cover asset URL.
   - `status`: `DRAFT` | `PUBLISHED` | `ARCHIVED`.
   - `category`: Post taxonomy (e.g. `Announcements`, `CFP`, `Venue`).
   - `views`: View counter.
   - `authorId`: Foreign key to `User`.
   - `publishedAt`, `createdAt`, `updatedAt`: Timestamps.

3. **`Page` (`website_pages`)**:
   - `id`: Page identifier (e.g. `home`, `committees`).
   - `slug`: URL route path (e.g. `home`, `committees`).
   - `title`: Page title.
   - `blocks`: JSON array of layout blocks with drag-and-drop ordering.
   - `isPublished`: Boolean status flag.
   - `metaTitle`, `metaDescription`: SEO metadata.

4. **`Setting` (`website_settings`)**:
   - `key`: Primary key (e.g. `header`, `footer`).
   - `data`: JSON object storing site-wide configuration.

---

## 3. Migration Workflow for Developers

### Step 1: Modifying the Schema
1. Open `prisma/schema.prisma`.
2. Make your proposed additions or alterations.
3. Validate the schema format:
   ```bash
   pnpm exec prisma format
   ```

### Step 2: Generating Prisma Client
Whenever `schema.prisma` changes, regenerate client types:
```bash
pnpm exec prisma generate
```

### Step 3: Development / Push Sync
In development environments with Neon DB:
```bash
pnpm exec prisma db push
```

### Step 4: Production Versioned Migrations
For production deployment, generate formal SQL migration files:
```bash
pnpm exec prisma migrate dev --name <descriptive_migration_name>
```
This writes a new timestamped migration directory under `prisma/migrations/`.

### Step 5: Applying Migrations on Production / Staging
On CI/CD or production server:
```bash
pnpm exec prisma migrate deploy
```

### Step 6: Database Seeding
To run or re-run the seed dataset (ensures `tctoan1024@gmail.com` has `ADMIN` role):
```bash
npx tsx prisma/seed.ts
```

---

## 4. Git Versioning & Release Checklist

- [ ] Schema changes are tested locally and verified against `pnpm run build`.
- [ ] No secrets or production connection strings are committed into git (verify `.env` is in `.gitignore`).
- [ ] Any new block types or post fields are synchronized with the TypeScript types in `src/lib/db.ts`.
- [ ] Migration files in `prisma/migrations/` are committed alongside the code that depends on them.
