/** Obtiene URL temporal de descarga de un media id de WhatsApp Cloud API */
export async function obtenerUrlMediaWhatsApp(mediaId: string): Promise<string | null> {
  const token = process.env.WHATSAPP_TOKEN
  if (!token) return null

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${encodeURIComponent(mediaId)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!res.ok) return null
  const json = (await res.json()) as { url?: string }
  return json.url ?? null
}
