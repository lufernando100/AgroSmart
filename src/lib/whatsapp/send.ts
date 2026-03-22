/**
 * Envía un mensaje de texto por WhatsApp Cloud API (Meta).
 * `telefono` puede ser con o sin + (se normaliza a dígitos).
 */
export async function enviarMensajeWhatsApp(
  telefono: string,
  mensaje: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    return { ok: false, error: 'WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID no configurados.' }
  }

  const digits = telefono.replace(/\D/g, '')
  if (digits.length < 10) {
    return { ok: false, error: 'Teléfono inválido.' }
  }

  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: digits,
      type: 'text',
      text: { body: mensaje },
    }),
  })

  const json = (await res.json()) as { error?: { message?: string } }
  if (!res.ok) {
    return {
      ok: false,
      error: json.error?.message ?? `HTTP ${res.status}`,
    }
  }

  return { ok: true }
}
