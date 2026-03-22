-- ============================================================
-- Catálogo legible vía API (PostgREST / supabase-js)
-- Ejecutar en Supabase SQL Editor si Table Editor muestra datos
-- pero la API REST devuelve 0 filas (RLS activo sin políticas).
-- ============================================================

ALTER TABLE public.categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.almacenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.precios DISABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.categorias TO anon, authenticated, service_role;
GRANT SELECT ON public.productos TO anon, authenticated, service_role;
GRANT SELECT ON public.almacenes TO anon, authenticated, service_role;
GRANT SELECT ON public.precios TO anon, authenticated, service_role;
