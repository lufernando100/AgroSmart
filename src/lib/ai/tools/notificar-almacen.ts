import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import type { ToolContext } from './registry'

export async function notificarAlmacen(
  input: Record<string, unknown>,
  _contexto: ToolContext
): Promise<unknown> {
  const telefono = String(input.telefono_whatsapp ?? '')
  const mensaje = String(input.mensaje ?? '')
  if (!telefono || !mensaje) {
    return { error: 'telefono o mensaje faltante' }
  }
  return sendWhatsAppMessage(telefono, mensaje)
}
