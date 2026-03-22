-- ============================================================
-- RLS en pedido_items (antes sin políticas = acceso ambiguo)
-- Ejecutar en Supabase después del modelo base.
-- ============================================================

ALTER TABLE pedido_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "caficultor_pedido_items_select" ON pedido_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = pedido_items.pedido_id AND p.caficultor_id = auth.uid()
    )
  );

CREATE POLICY "caficultor_pedido_items_insert" ON pedido_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = pedido_items.pedido_id AND p.caficultor_id = auth.uid()
    )
  );

CREATE POLICY "almacen_pedido_items_select" ON pedido_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM pedidos p
      WHERE p.id = pedido_items.pedido_id
        AND p.almacen_id IN (
          SELECT id FROM almacenes WHERE usuario_id = auth.uid()
        )
    )
  );

-- El almacén no inserta líneas normalmente; actualizaciones vía pedido
