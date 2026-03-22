import { createAdminClient } from '@/lib/supabase/admin'
import {
  confirmOrderByWhatsAppAdmin,
  rejectOrderByWhatsAppAdmin,
} from '@/lib/pedidos/service'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'

/**
 * Si el mensaje es SI/NO y el remitente coincide con `whatsapp_phone` de un almacén,
 * confirma o rechaza el pedido pendiente más reciente de ese almacén.
 */
export async function intentarProcesarSiNoAlmacen(
  telefonoFromDigits: string,
  texto: string
): Promise<boolean> {
  const t = texto.trim().toUpperCase()
  const esSi = t === 'SI' || t.startsWith('SI ')
  const esNo = t === 'NO' || t.startsWith('NO ')
  if (!esSi && !esNo) return false

  const admin = createAdminClient()
  const d = telefonoFromDigits.replace(/\D/g, '')

  const { data: warehouses, error } = await admin
    .from('warehouses')
    .select('id')
    .eq('whatsapp_phone', d)
    .limit(1)

  if (error || !warehouses?.length) return false

  const warehouseId = warehouses[0].id as string

  const { data: order } = await admin
    .from('orders')
    .select('id, order_number, farmer_id')
    .eq('warehouse_id', warehouseId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!order) return false

  const orderId = order.id as string
  const orderNumber = order.order_number as string
  const farmerId = order.farmer_id as string

  try {
    if (esSi) {
      await confirmOrderByWhatsAppAdmin(orderId)
    } else {
      const motivo =
        texto.trim().length > 2 ? texto.trim().slice(2).trim() : ''
      await rejectOrderByWhatsAppAdmin(
        orderId,
        motivo || 'Rechazado por almacén'
      )
    }

    const { data: farmer } = await admin
      .from('users')
      .select('phone')
      .eq('id', farmerId)
      .maybeSingle()

    const telCaf = farmer?.phone as string | undefined
    if (telCaf) {
      const msg = esSi
        ? `Tu pedido ${orderNumber} quedó confirmado. GranoVivo.`
        : `Tu pedido ${orderNumber} no pudo ser atendido por el almacén. GranoVivo.`
      await sendWhatsAppMessage(telCaf, msg)
    }
  } catch {
    await sendWhatsAppMessage(
      d,
      'No pudimos actualizar el pedido. Intenta de nuevo o usa el panel web.'
    )
  }

  return true
}
