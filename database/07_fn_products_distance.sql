-- Product search with min price, warehouse count, distance (km). Used by GET /api/productos/buscar

CREATE OR REPLACE FUNCTION public.products_with_distance(
  p_lat double precision,
  p_lng double precision,
  p_search text DEFAULT NULL,
  p_category_id uuid DEFAULT NULL,
  p_sector sector_type DEFAULT 'coffee'
)
RETURNS TABLE (
  product_id uuid,
  name varchar,
  short_name varchar,
  presentation varchar,
  unit_of_measure varchar,
  category_id uuid,
  min_price numeric,
  warehouses_with_price bigint,
  min_distance_km double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id AS product_id,
    p.name,
    p.short_name,
    p.presentation,
    p.unit_of_measure,
    p.category_id,
    MIN(pr.unit_price)::numeric AS min_price,
    COUNT(DISTINCT pr.warehouse_id)::bigint AS warehouses_with_price,
    (MIN(
      ST_Distance(
        w.location,
        ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
      )
    ) / 1000.0)::double precision AS min_distance_km
  FROM products p
  INNER JOIN prices pr ON pr.product_id = p.id AND pr.is_available = true
  INNER JOIN warehouses w ON w.id = pr.warehouse_id
    AND w.active = true
    AND COALESCE(w.accepts_digital_orders, true) = true
    AND w.location IS NOT NULL
  WHERE p.active = true
    AND p.sector = p_sector
    AND (
      p_search IS NULL
      OR trim(p_search) = ''
      OR p.name ILIKE '%' || p_search || '%'
      OR (p.short_name IS NOT NULL AND p.short_name ILIKE '%' || p_search || '%')
    )
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
  GROUP BY p.id, p.name, p.short_name, p.presentation, p.unit_of_measure, p.category_id
  ORDER BY min_distance_km ASC NULLS LAST, min_price ASC
  LIMIT 100;
$$;

GRANT EXECUTE ON FUNCTION public.products_with_distance(
  double precision,
  double precision,
  text,
  uuid,
  sector_type
) TO anon, authenticated, service_role;
