import { createAdminClient } from '@/lib/supabase/admin'
import {
  confirmarPedidoPorWhatsAppAdmin,
  rechazarPedidoPorWhatsAppAdmin,
} from '@/lib/pedidos/service'
import { enviarMensajeWhatsApp } from '@/lib/whatsapp/send'

/**
 * Si el mensaje es SI/NO y el remitente coincide con `telefono_whatsapp` de un almacén,
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

  const { data: almacenes, error } = await admin
    .from('almacenes')
    .select('id')
    .eq('telefono_whatsapp', d)
    .limit(1)

  if (error || !almacenes?.length) return false

  const almacenId = almacenes[0].id as string

  const { data: pedido } = await admin
    .from('pedidos')
    .select('id, numero, caficultor_id')
    .eq('almacen_id', almacenId)
    .eq('estado', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!pedido) return false

  const pedidoId = pedido.id as string
  const numero = pedido.numero as string
  const caficultorId = pedido.caficultor_id as string

  try {
    if (esSi) {
      await confirmarPedidoPorWhatsAppAdmin(pedidoId)
    } else {
      const motivo =
        texto.trim().length > 2 ? texto.trim().slice(2).trim() : ''
      await rechazarPedidoPorWhatsAppAdmin(
        pedidoId,
        motivo || 'Rechazado por almacén'
      )
    }

    const { data: cafi } = await admin
      .from('usuarios')
      .select('telefono')
      .eq('id', caficultorId)
      .maybeSingle()

    const telCaf = cafi?.telefono as string | undefined
    if (telCaf) {
      const msg = esSi
        ? `Tu pedido ${numero} quedó confirmado. GranoVivo.`
        : `Tu pedido ${numero} no pudo ser atendido por el almacén. GranoVivo.`
      await enviarMensajeWhatsApp(telCaf, msg)
    }
  } catch {
    await enviarMensajeWhatsApp(
      d,
      'No pudimos actualizar el pedido. Intenta de nuevo o usa el panel web.'
    )
  }

  return true
}

