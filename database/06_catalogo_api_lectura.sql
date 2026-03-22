-- Catalog readable via PostgREST (disable RLS on read-heavy tables)
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices DISABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.categories TO anon, authenticated, service_role;
GRANT SELECT ON public.products TO anon, authenticated, service_role;
GRANT SELECT ON public.warehouses TO anon, authenticated, service_role;
GRANT SELECT ON public.prices TO anon, authenticated, service_role;
