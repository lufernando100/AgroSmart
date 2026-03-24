import type { SupabaseClient } from '@supabase/supabase-js'
import { formatCOP } from '@/lib/utils/format'

/**
 * Builds a short WhatsApp message listing order lines for the warehouse.
 */
export async function buildNewOrderWhatsAppMessage(
  supabase: SupabaseClient,
  orderId: string
): Promise<string | null> {
  const { data: order, error: e0 } = await supabase
    .from('orders')
    .select('order_number')
    .eq('id', orderId)
    .maybeSingle()

  if (e0 || !order?.order_number) return null

  const { data: rows, error: e1 } = await supabase
    .from('order_items')
    .select(
      'quantity, unit_price, subtotal, products ( name, short_name )'
    )
    .eq('order_id', orderId)

  if (e1 || !rows?.length) {
    return `Nuevo pedido ${order.order_number as string} en GranoVivo. Revisa el panel o responde por aquí.`
  }

  const lines: string[] = []
  for (const row of rows) {
    if (typeof row !== 'object' || row === null) continue
    const r = row as Record<string, unknown>
    const qty = r.quantity
    const sub = r.subtotal
    const pr = r.products
    const p = Array.isArray(pr) ? pr[0] : pr
    let name = 'Producto'
    if (typeof p === 'object' && p !== null) {
      const po = p as Record<string, unknown>
      const sn = po.short_name
      const n = po.name
      if (typeof sn === 'string' && sn.trim()) name = sn
      else if (typeof n === 'string' && n.trim()) name = n
    }
    const q = typeof qty === 'number' ? qty : Number(qty)
    const st = typeof sub === 'number' ? sub : Number(sub)
    lines.push(`• ${name} × ${q} = ${formatCOP(st)}`)
  }

  const body = lines.join('\n')
  return `Nuevo pedido ${order.order_number as string} en GranoVivo:\n${body}\n\nRevisa el panel o responde por aquí.`
}
