-- Rollback Script Template for DevTeam AI
-- 
-- This file contains SQL commands to rollback migrations if needed.
-- IMPORTANT: Always backup your database before running rollback scripts!
--
-- Usage:
--   psql $DATABASE_URL -f rollback.sql
--
-- Or via Docker:
--   docker exec -i devteam-postgres psql -U postgres -d devteam_ai < rollback.sql

-- ============================================================
-- ROLLBACK: Initial Migration (20260123192548_init)
-- ============================================================
-- Uncomment the following to drop all tables created by init migration
-- WARNING: This will DELETE ALL DATA!

-- BEGIN;

-- -- Drop dependent tables first (respect foreign key constraints)
-- DROP TABLE IF EXISTS "MessageAttachment" CASCADE;
-- DROP TABLE IF EXISTS "MessageReaction" CASCADE;
-- DROP TABLE IF EXISTS "Message" CASCADE;
-- DROP TABLE IF EXISTS "FileVersion" CASCADE;
-- DROP TABLE IF EXISTS "File" CASCADE;
-- DROP TABLE IF EXISTS "AgentActivity" CASCADE;
-- DROP TABLE IF EXISTS "AgentState" CASCADE;
-- DROP TABLE IF EXISTS "TaskComment" CASCADE;
-- DROP TABLE IF EXISTS "TaskDependency" CASCADE;
-- DROP TABLE IF EXISTS "Task" CASCADE;
-- DROP TABLE IF EXISTS "ProjectMember" CASCADE;
-- DROP TABLE IF EXISTS "ProjectSettings" CASCADE;
-- DROP TABLE IF EXISTS "Project" CASCADE;
-- DROP TABLE IF EXISTS "VerificationToken" CASCADE;
-- DROP TABLE IF EXISTS "Session" CASCADE;
-- DROP TABLE IF EXISTS "Account" CASCADE;
-- DROP TABLE IF EXISTS "User" CASCADE;

-- -- Drop enums
-- DROP TYPE IF EXISTS "SenderType" CASCADE;
-- DROP TYPE IF EXISTS "AgentType" CASCADE;
-- DROP TYPE IF EXISTS "Priority" CASCADE;
-- DROP TYPE IF EXISTS "TaskStatus" CASCADE;
-- DROP TYPE IF EXISTS "Visibility" CASCADE;
-- DROP TYPE IF EXISTS "ProjectStatus" CASCADE;

-- -- Remove Prisma migration tracking
-- DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- COMMIT;

-- SELECT 'Rollback completed successfully!' AS status;
