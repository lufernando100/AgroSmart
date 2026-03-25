import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all dependencies before importing
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

vi.mock('@/lib/users/lookup', () => ({
  findUserByPhoneDigits: vi.fn(),
}))

vi.mock('@/lib/whatsapp/send', () => ({
  sendWhatsAppMessage: vi.fn().mockResolvedValue({ ok: true }),
}))

vi.mock('@/lib/whatsapp/almacenRespuesta', () => ({
  intentarProcesarSiNoAlmacen: vi.fn().mockResolvedValue(false),
}))

vi.mock('@/lib/whatsapp/media', () => ({
  obtenerUrlMediaWhatsApp: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/ai/transcribe-audio', () => ({
  transcribirAudioWhatsapp: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/whatsapp/llmWhatsApp', () => ({
  runLLMParaWhatsApp: vi.fn().mockResolvedValue('Respuesta del asistente'),
}))

import { processIncomingWebhook } from './processIncoming'
import { intentarProcesarSiNoAlmacen } from './almacenRespuesta'
import { sendWhatsAppMessage } from './send'
import { findUserByPhoneDigits } from '@/lib/users/lookup'

function makeWebhookBody(from: string, text: string) {
  return {
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from,
                  id: 'wamid_test',
                  type: 'text',
                  text: { body: text },
                },
              ],
            },
          },
        ],
      },
    ],
  }
}

describe('processIncomingWebhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does nothing with a null body', async () => {
    await processIncomingWebhook(null)
    expect(sendWhatsAppMessage).not.toHaveBeenCalled()
  })

  it('does nothing with a body that has no entry array', async () => {
    await processIncomingWebhook({ foo: 'bar' })
    expect(sendWhatsAppMessage).not.toHaveBeenCalled()
  })

  it('does nothing with an empty entry array', async () => {
    await processIncomingWebhook({ entry: [] })
    expect(sendWhatsAppMessage).not.toHaveBeenCalled()
  })

  it('tries the warehouse SI/NO handler first', async () => {
    vi.mocked(intentarProcesarSiNoAlmacen).mockResolvedValueOnce(true)
    await processIncomingWebhook(makeWebhookBody('573001234567', 'SI'))
    expect(intentarProcesarSiNoAlmacen).toHaveBeenCalledWith('573001234567', 'SI')
  })

  it('sends an unregistered-user message when the phone is not found', async () => {
    vi.mocked(intentarProcesarSiNoAlmacen).mockResolvedValueOnce(false)
    vi.mocked(findUserByPhoneDigits).mockResolvedValueOnce(null)

    await processIncomingWebhook(makeWebhookBody('573001234567', 'Hola'))

    expect(sendWhatsAppMessage).toHaveBeenCalledWith(
      '573001234567',
      expect.stringContaining('no encontramos tu número')
    )
  })

  it('does nothing when the message text is empty', async () => {
    vi.mocked(intentarProcesarSiNoAlmacen).mockResolvedValueOnce(false)

    await processIncomingWebhook(makeWebhookBody('573001234567', ''))
    expect(findUserByPhoneDigits).not.toHaveBeenCalled()
  })

  it('does not throw with a malformed payload', async () => {
    await expect(
      processIncomingWebhook({ entry: [{ changes: [{ value: {} }] }] })
    ).resolves.toBeUndefined()
  })
})
