-- Optional metadata on orders (e.g. farmer WhatsApp notify outcome) — run after 01_data_model.sql
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.orders.metadata IS 'Extensible JSON: farmer_whatsapp_notify { at, status } etc.';
