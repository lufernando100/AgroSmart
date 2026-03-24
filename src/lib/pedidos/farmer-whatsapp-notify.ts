import { createAdminClient } from '@/lib/supabase/admin'

export type FarmerWhatsappNotifyStatus = 'sent' | 'failed' | 'skipped_no_phone'

/**
 * Persists outcome of WhatsApp notify attempt so the farmer UI can show a fallback message.
 * Uses service role to merge into orders.metadata regardless of RLS.
 */
export async function recordFarmerWhatsappNotifyOutcome(params: {
  orderId: string
  status: FarmerWhatsappNotifyStatus
  /** Logged server-side only — not persisted on the order row */
  errorHint?: string
}): Promise<void> {
  const admin = createAdminClient()
  const { data: row, error: selErr } = await admin
    .from('orders')
    .select('metadata')
    .eq('id', params.orderId)
    .maybeSingle()

  if (selErr) {
    console.warn('[orders] recordFarmerWhatsappNotifyOutcome select failed:', selErr.message)
    return
  }

  const existing =
    row &&
    typeof row === 'object' &&
    'metadata' in row &&
    row.metadata !== null &&
    typeof row.metadata === 'object' &&
    !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {}

  if (params.status === 'failed' && params.errorHint) {
    console.warn('[orders] farmer WhatsApp notify failed detail:', params.errorHint)
  }

  const payload: Record<string, unknown> = {
    at: new Date().toISOString(),
    status: params.status,
  }

  const metadata = {
    ...existing,
    farmer_whatsapp_notify: payload,
  }

  const { error: upErr } = await admin
    .from('orders')
    .update({ metadata, updated_at: new Date().toISOString() })
    .eq('id', params.orderId)

  if (upErr) {
    console.warn('[orders] recordFarmerWhatsappNotifyOutcome update failed:', upErr.message)
  }
}
