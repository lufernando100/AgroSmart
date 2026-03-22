import OpenAI from 'openai'

/**
 * Descarga audio desde URL de Meta (requiere WHATSAPP_TOKEN) y transcribe con Whisper.
 */
export async function transcribirAudioWhatsapp(mediaUrl: string): Promise<string | null> {
  const waToken = process.env.WHATSAPP_TOKEN
  const openaiKey = process.env.OPENAI_API_KEY
  if (!waToken || !openaiKey) return null

  const mediaRes = await fetch(mediaUrl, {
    headers: { Authorization: `Bearer ${waToken}` },
  })
  if (!mediaRes.ok) return null

  const blob = await mediaRes.blob()
  const openai = new OpenAI({ apiKey: openaiKey })

  const file = new File([blob], 'audio.ogg', { type: blob.type || 'audio/ogg' })
  const tr = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'es',
  })

  return tr.text
}
