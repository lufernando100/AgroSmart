import { createAdminClient } from '@/lib/supabase/admin'
import { createOrderAdmin } from '@/lib/pedidos/service'
import { buildNewOrderWhatsAppMessage } from '@/lib/pedidos/whatsapp-order-summary'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import type { ToolContext } from './registry'

export async function crearPedido(
  input: Record<string, unknown>,
  contexto: ToolContext
): Promise<unknown> {
  const warehouseId = String(input.almacen_id ?? input.warehouse_id ?? '')
  const itemsRaw = input.items
  const canal =
    input.canal === 'whatsapp' || input.canal === 'pwa' ? input.canal : contexto.channel
  const notas = typeof input.notas === 'string' ? input.notas : undefined

  if (!Array.isArray(itemsRaw)) {
    return { error: 'items inválidos' }
  }

  const items: { product_id: string; quantity: number }[] = []
  for (const row of itemsRaw) {
    if (typeof row === 'object' && row !== null) {
      const r = row as Record<string, unknown>
      const pid = r.producto_id ?? r.product_id
      const qty = r.cantidad ?? r.quantity
      if (pid != null && qty != null) {
        items.push({ product_id: String(pid), quantity: Number(qty) })
      }
    }
  }

  const farmerId = String(input.caficultor_id ?? input.farmer_id ?? '') || contexto.farmerId

  const out = await createOrderAdmin({ farmerId, warehouseId, channel: canal, notes: notas, items })

  const admin = createAdminClient()
  const { data: wh } = await admin
    .from('warehouses')
    .select('whatsapp_phone, name')
    .eq('id', warehouseId)
    .maybeSingle()

  if (wh?.whatsapp_phone) {
    try {
      const detailed = await buildNewOrderWhatsAppMessage(admin, out.orderId)
      await sendWhatsAppMessage(
        wh.whatsapp_phone as string,
        detailed ?? `Nuevo pedido ${out.orderNumber} en GranoVivo. Productos: ${items.length} línea(s).`
      )
    } catch {
      /* notification is best-effort */
    }
  }

  return {
    order_id: out.orderId,
    order_number: out.orderNumber,
    total: out.total,
    almacen: wh?.name,
  }
}
