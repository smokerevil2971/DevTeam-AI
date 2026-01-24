# Database Migration Guide

This document describes how to manage database migrations for DevTeam AI.

## Prerequisites

- PostgreSQL database running (via Docker or locally)
- `DATABASE_URL` environment variable set in `packages/database/.env`

## Commands

### Apply Migrations (Development)

```bash
# Navigate to database package
cd packages/database

# Create and apply a new migration
pnpm exec prisma migrate dev --name your_migration_name

# Or from the root directory
pnpm --filter @devteam/database exec prisma migrate dev --name your_migration_name
```

### Apply Migrations (Production)

```bash
# Apply pending migrations without generating new ones
pnpm --filter @devteam/database exec prisma migrate deploy
```

### Reset Database

```bash
# WARNING: This will delete all data!
pnpm --filter @devteam/database exec prisma migrate reset
```

### View Migration Status

```bash
pnpm --filter @devteam/database exec prisma migrate status
```

### Seed Database

```bash
pnpm --filter @devteam/database exec prisma db seed
```

## Rollback Procedures

### Option 1: Create a Reverse Migration

Create a new migration that undoes the changes:

```bash
pnpm --filter @devteam/database exec prisma migrate dev --name rollback_feature_xyz
```

### Option 2: Restore from Backup

1. Stop the application
2. Restore the database from backup
3. Run `prisma migrate deploy` to verify migration state

### Option 3: Manual SQL Rollback

Each migration folder contains a `migration.sql` file. To rollback:

1. Review the SQL in the migration folder
2. Write inverse SQL statements
3. Execute against the database manually:

```bash
psql $DATABASE_URL -f rollback_script.sql
```

## Best Practices

1. **Always test migrations locally first** before applying to staging/production
2. **Create backups before major migrations**
3. **Review generated SQL** in `prisma/migrations/` before applying
4. **Use meaningful migration names** (e.g., `add_user_avatar_field`)
5. **Keep migrations small and focused** on a single change
