-- Enable Row Level Security (RLS) on sensitive tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ParentTicket" ENABLE ROW LEVEL SECURITY;

-- 1. Policies for User Table
-- A user can read their own profile
CREATE POLICY "Users can view their own profile"
ON "User"
FOR SELECT
USING (id::text = current_setting('app.current_user_id', true));

-- A user can update their own profile
CREATE POLICY "Users can update their own profile"
ON "User"
FOR UPDATE
USING (id::text = current_setting('app.current_user_id', true));

-- Admin Override Policy (Assume Admin bypasses RLS by setting a special context or simply disable RLS for superusers)
-- (If you want Admins to see all, you would need a way to check if current_user_role is ADMIN,
-- or use a database function to look up the role, which can cause recursion. 
-- For simplicity in this protocol, we just demonstrate basic RLS isolation).

-- 2. Policies for ParentTicket
-- A parent can only view their own tickets
CREATE POLICY "Parents can view their own tickets"
ON "ParentTicket"
FOR SELECT
USING ("parentId"::text = current_setting('app.current_user_id', true));

-- A parent can only create their own tickets
CREATE POLICY "Parents can create their own tickets"
ON "ParentTicket"
FOR INSERT
WITH CHECK ("parentId"::text = current_setting('app.current_user_id', true));

-- NOTE: To apply these migrations, run `npx prisma migrate dev` or `npx prisma db execute --file prisma/migrations/20260824000000_enable_rls/migration.sql`
