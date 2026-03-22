import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all dependencies before importing
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}))

vi.mock('@/lib/usuarios/lookup', () => ({
  buscarUsuarioPorTelefono: vi.fn(),
}))

vi.mock('@/lib/whatsapp/send', () => ({
  enviarMensajeWhatsApp: vi.fn().mockResolvedValue({ ok: true }),
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

vi.mock('@/lib/whatsapp/claudeWhatsApp', () => ({
  runClaudeParaWhatsApp: vi.fn().mockResolvedValue('Respuesta del asistente'),
}))

import { processIncomingWebhook } from './processIncoming'
import { intentarProcesarSiNoAlmacen } from './almacenRespuesta'
import { enviarMensajeWhatsApp } from './send'
import { buscarUsuarioPorTelefono } from '@/lib/usuarios/lookup'

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

  it('no hace nada con body null', async () => {
    await processIncomingWebhook(null)
    expect(enviarMensajeWhatsApp).not.toHaveBeenCalled()
  })

  it('no hace nada con body sin entry', async () => {
    await processIncomingWebhook({ foo: 'bar' })
    expect(enviarMensajeWhatsApp).not.toHaveBeenCalled()
  })

  it('no hace nada con entry vacío', async () => {
    await processIncomingWebhook({ entry: [] })
    expect(enviarMensajeWhatsApp).not.toHaveBeenCalled()
  })

  it('intenta procesar SI/NO de almacén primero', async () => {
    vi.mocked(intentarProcesarSiNoAlmacen).mockResolvedValueOnce(true)
    await processIncomingWebhook(makeWebhookBody('573001234567', 'SI'))
    expect(intentarProcesarSiNoAlmacen).toHaveBeenCalledWith('573001234567', 'SI')
  })

  it('envía mensaje de usuario no registrado', async () => {
    vi.mocked(intentarProcesarSiNoAlmacen).mockResolvedValueOnce(false)
    vi.mocked(buscarUsuarioPorTelefono).mockResolvedValueOnce(null)

    await processIncomingWebhook(makeWebhookBody('573001234567', 'Hola'))

    expect(enviarMensajeWhatsApp).toHaveBeenCalledWith(
      '573001234567',
      expect.stringContaining('no encontramos tu número')
    )
  })

  it('no hace nada con texto vacío', async () => {
    vi.mocked(intentarProcesarSiNoAlmacen).mockResolvedValueOnce(false)

    await processIncomingWebhook(makeWebhookBody('573001234567', ''))
    expect(buscarUsuarioPorTelefono).not.toHaveBeenCalled()
  })

  it('no lanza excepción con payload malformado', async () => {
    await expect(
      processIncomingWebhook({ entry: [{ changes: [{ value: {} }] }] })
    ).resolves.toBeUndefined()
  })
})
