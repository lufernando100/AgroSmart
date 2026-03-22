import { createAdminClient } from '@/lib/supabase/admin'
import { findUserByPhoneDigits } from '@/lib/users/lookup'
import { enviarMensajeWhatsApp } from '@/lib/whatsapp/send'
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
    const tipo = typeof msg.type === 'string' ? msg.type : 'text'

    if (tipo === 'text') {
      const tb = isRecord(msg.text) ? msg.text.body : undefined
      const texto = typeof tb === 'string' ? tb : ''
      if (await intentarProcesarSiNoAlmacen(from, texto)) return
      if (!texto.trim()) return
      await flujoCaficultor(from, texto, msgId)
      return
    }

    if (tipo === 'audio') {
      const audio = isRecord(msg.audio) ? msg.audio : null
      const mid = audio && typeof audio.id === 'string' ? audio.id : null
      if (!mid) return
      const url = await obtenerUrlMediaWhatsApp(mid)
      if (!url) return
      const texto = await transcribirAudioWhatsapp(url)
      if (!texto?.trim()) {
        await enviarMensajeWhatsApp(
          from,
          'No pude entender el audio. ¿Puedes escribirlo?'
        )
        return
      }
      await flujoCaficultor(from, texto, msgId)
    }
  } catch (e) {
    console.error('processIncomingWebhook', e)
  }
}

async function flujoCaficultor(
  telefonoFrom: string,
  texto: string,
  whatsappMessageId?: string
) {
  const digits = telefonoFrom.replace(/\D/g, '')
  const usuario = await findUserByPhoneDigits(digits)
  if (!usuario) {
    await enviarMensajeWhatsApp(
      telefonoFrom,
      'GranoVivo: no encontramos tu número registrado. Entra en la app e inicia sesión con tu celular para vincular tu cuenta.'
    )
    return
  }

  const admin = createAdminClient()
  await admin.from('conversations').insert({
    user_id: usuario.id,
    channel: 'whatsapp',
    whatsapp_message_id: whatsappMessageId ?? null,
    role: 'user',
    content: texto,
    content_type: 'text',
  })

  const respuesta = await runClaudeParaWhatsApp({
    farmerId: usuario.id,
    textoUsuario: texto,
  })

  await enviarMensajeWhatsApp(telefonoFrom, respuesta)

  await admin.from('conversations').insert({
    user_id: usuario.id,
    channel: 'whatsapp',
    role: 'assistant',
    content: respuesta,
    content_type: 'text',
  })
}
