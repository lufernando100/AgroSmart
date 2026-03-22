-- ============================================================
-- Búsqueda de productos con precio mínimo, nº almacenes y
-- distancia (km) al punto del caficultor. Usada por GET /api/productos/buscar.
-- Ejecutar en Supabase SQL Editor después del modelo y semilla.
-- ============================================================

CREATE OR REPLACE FUNCTION public.productos_con_distancia(
  p_lat double precision,
  p_lng double precision,
  p_busqueda text DEFAULT NULL,
  p_categoria_id uuid DEFAULT NULL,
  p_sector sector_tipo DEFAULT 'cafe'
)
RETURNS TABLE (
  producto_id uuid,
  nombre varchar,
  nombre_corto varchar,
  presentacion varchar,
  unidad_medida varchar,
  categoria_id uuid,
  precio_min numeric,
  almacenes_con_precio bigint,
  distancia_km_min double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id AS producto_id,
    p.nombre,
    p.nombre_corto,
    p.presentacion,
    p.unidad_medida,
    p.categoria_id,
    MIN(pr.precio_unitario)::numeric AS precio_min,
    COUNT(DISTINCT pr.almacen_id)::bigint AS almacenes_con_precio,
    (MIN(
      ST_Distance(
        a.ubicacion,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
      )
    ) / 1000.0)::double precision AS distancia_km_min
  FROM productos p
  INNER JOIN precios pr ON pr.producto_id = p.id AND pr.disponible = true
  INNER JOIN almacenes a ON a.id = pr.almacen_id
    AND a.activo = true
    AND COALESCE(a.acepta_pedidos_digitales, true) = true
    AND a.ubicacion IS NOT NULL
  WHERE p.activo = true
    AND p.sector = p_sector
    AND (
      p_busqueda IS NULL
      OR trim(p_busqueda) = ''
      OR p.nombre ILIKE '%' || p_busqueda || '%'
      OR (p.nombre_corto IS NOT NULL AND p.nombre_corto ILIKE '%' || p_busqueda || '%')
    )
    AND (p_categoria_id IS NULL OR p.categoria_id = p_categoria_id)
  GROUP BY p.id, p.nombre, p.nombre_corto, p.presentacion, p.unidad_medida, p.categoria_id
  ORDER BY distancia_km_min ASC NULLS LAST, precio_min ASC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.productos_con_distancia(
  double precision,
  double precision,
  text,
  uuid,
  sector_tipo
) TO anon, authenticated, service_role;
