-- Run in Supabase → SQL Editor (same project as NEXT_PUBLIC_SUPABASE_URL).
-- Diagnóstico: pedido, caficultor y teléfono para notificación WhatsApp al confirmar.

-- 1) Últimos pedidos (ajustá LIMIT o filtrá por order_number)
SELECT id,
       order_number,
       status,
       farmer_id,
       warehouse_id,
       created_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;

-- 2) Teléfono del caficultor por farmer_id (reemplazá el UUID)
-- SELECT id, phone, name, role
-- FROM public.users
-- WHERE id = 'PASTE_FARMER_UUID_FROM_ORDERS';

-- 3) Un solo query: pedido + teléfono del comprador
SELECT o.order_number,
       o.status,
       o.farmer_id,
       u.phone AS farmer_phone_in_db,
       LENGTH(TRIM(COALESCE(u.phone, ''))) AS phone_len
FROM public.orders o
JOIN public.users u ON u.id = o.farmer_id
ORDER BY o.created_at DESC
LIMIT 10;
