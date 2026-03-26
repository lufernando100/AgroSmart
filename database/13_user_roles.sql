-- Migration: multi-role user support
-- Run in Supabase SQL editor after existing migrations

-- 1. Table to support one user having multiple roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role   NOT NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- 2. RLS: users can only read their own roles; admin writes via service role
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- 3. Populate from existing usuarios table (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, u.role
FROM public.usuarios u
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Helper: returns the active role for the current JWT session.
--    Reads active_role from user_metadata first (set by role-switch API),
--    then falls back to role in user_metadata, then to user_roles table.
CREATE OR REPLACE FUNCTION public.get_my_active_role()
RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF((auth.jwt() -> 'user_metadata' ->> 'active_role'), '')::user_role,
    NULLIF((auth.jwt() -> 'user_metadata' ->> 'role'), '')::user_role,
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() AND is_active = true LIMIT 1)
  )
$$;

GRANT EXECUTE ON FUNCTION public.get_my_active_role() TO authenticated;
