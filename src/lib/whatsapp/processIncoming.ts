import { createAdminClient } from '@/lib/supabase/admin'
import { findUserByPhoneDigits } from '@/lib/users/lookup'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { intentarProcesarSiNoAlmacen } from '@/lib/whatsapp/almacenRespuesta'
import { obtenerUrlMediaWhatsApp } from '@/lib/whatsapp/media'
import { transcribirAudioWhatsapp } from '@/lib/ai/transcribe-audio'
import { runClaudeParaWhatsApp } from '@/lib/whatsapp/claudeWhatsApp'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

export async function processIncomingWebhook(body: unknown) {
  try {
    if (!isRecord(body)) return
    const entry = body.entry
    if (!Array.isArray(entry) || !isRecord(entry[0])) return
    const changes = (entry[0] as { changes?: unknown }).changes
    if (!Array.isArray(changes) || !isRecord(changes[0])) return
    const value = (changes[0] as { value?: unknown }).value
    if (!isRecord(value)) return
    const messages = value.messages
    if (!Array.isArray(messages) || !isRecord(messages[0])) return
    const msg = messages[0]

    const from = msg.from
    if (typeof from !== 'string') return

    const msgId = typeof msg.id === 'string' ? msg.id : undefined
    const msgType = typeof msg.type === 'string' ? msg.type : 'text'

    if (msgType === 'text') {
      const tb = isRecord(msg.text) ? msg.text.body : undefined
      const text = typeof tb === 'string' ? tb : ''
      // Check if this is a warehouse YES/NO reply before routing to farmer flow
      if (await intentarProcesarSiNoAlmacen(from, text)) return
      if (!text.trim()) return
      await farmerFlow(from, text, msgId)
      return
    }

    if (msgType === 'audio') {
      const audio = isRecord(msg.audio) ? msg.audio : null
      const mediaId = audio && typeof audio.id === 'string' ? audio.id : null
      if (!mediaId) return
      const url = await obtenerUrlMediaWhatsApp(mediaId)
      if (!url) return
      const text = await transcribirAudioWhatsapp(url)
      if (!text?.trim()) {
        await sendWhatsAppMessage(
          from,
          'No pude entender el audio. ¿Puedes escribirlo?'
        )
        return
      }
      await farmerFlow(from, text, msgId)
    }
  } catch (e) {
    console.error('processIncomingWebhook', e)
  }
}

async function farmerFlow(
  fromPhone: string,
  text: string,
  whatsappMessageId?: string
) {
  const digits = fromPhone.replace(/\D/g, '')
  const user = await findUserByPhoneDigits(digits)
  if (!user) {
    await sendWhatsAppMessage(
      fromPhone,
      'GranoVivo: no encontramos tu número registrado. Entra en la app e inicia sesión con tu celular para vincular tu cuenta.'
    )
    return
  }

  const admin = createAdminClient()

  // Record the incoming message in conversation history
  await admin.from('conversations').insert({
    user_id: user.id,
    channel: 'whatsapp',
    whatsapp_message_id: whatsappMessageId ?? null,
    role: 'user',
    content: text,
    content_type: 'text',
  })

  const response = await runClaudeParaWhatsApp({
    farmerId: user.id,
    textoUsuario: text,
  })

  await sendWhatsAppMessage(fromPhone, response)

  // Record the assistant reply in conversation history
  await admin.from('conversations').insert({
    user_id: user.id,
    channel: 'whatsapp',
    role: 'assistant',
    content: response,
    content_type: 'text',
  })
}
