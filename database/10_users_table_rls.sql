-- Optional fix if public.users had RLS enabled manually in Supabase Dashboard.
-- The app creates the profile row with the service_role client (bypasses RLS when the key is correct).
-- Schema in 01_data_model.sql does not enable RLS on users; stray RLS here is unnecessary.
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
