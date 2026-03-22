-- ============================================================
-- Realtime: cambios en pedidos (PWA — seguimiento en vivo)
-- Ejecutar en Supabase SQL Editor (o migración).
-- En Dashboard: Database → Replication → habilitar pedidos si prefieres UI.
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
