ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "farmer_order_items_select" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.farmer_id = auth.uid()
    )
  );

CREATE POLICY "farmer_order_items_insert" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id AND o.farmer_id = auth.uid()
    )
  );

CREATE POLICY "warehouse_order_items_select" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.warehouse_id IN (
          SELECT id FROM warehouses WHERE user_id = auth.uid()
        )
    )
  );
