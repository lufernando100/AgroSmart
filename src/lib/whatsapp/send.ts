/**
 * Sends a text message via WhatsApp Cloud API (Meta).
 * `phone` can be with or without + (normalized to digits only).
 */
export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    return { ok: false, error: 'WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not configured.' }
  }

  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) {
    return { ok: false, error: 'Invalid phone number.' }
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
      text: { body: message },
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
