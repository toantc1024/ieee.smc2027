# Prisma Database Directory

This directory contains the database schema and seed data for the **IEEE SMC 2027** conference portal.

## Files
- [`schema.prisma`](./schema.prisma): Complete PostgreSQL schema definition, enums, models, and relations.
- [`seed.ts`](./seed.ts): Initial seeding script for default administrators, sample posts, and settings.

## Documentation
For the full schema specifications, ERD diagram, table columns, indexes, and instructions on managing user roles, see:
👉 [Database Structure & Management Guide (`docs/DATABASE.md`)](../docs/DATABASE.md)

## Common Commands
```bash
# Push schema changes to database
pnpm db:push

# Generate Prisma Client
pnpm db:generate

# Open Prisma Studio web GUI
pnpm db:studio
```
