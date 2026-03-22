import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { enviarMensajeWhatsApp } from './send'

describe('enviarMensajeWhatsApp', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
    vi.restoreAllMocks()
  })

  it('retorna error si WHATSAPP_TOKEN no está configurado', async () => {
    delete process.env.WHATSAPP_TOKEN
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123'
    const result = await enviarMensajeWhatsApp('3001234567', 'Hola')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('no configurados')
  })

  it('retorna error si WHATSAPP_PHONE_NUMBER_ID no está configurado', async () => {
    process.env.WHATSAPP_TOKEN = 'token'
    delete process.env.WHATSAPP_PHONE_NUMBER_ID
    const result = await enviarMensajeWhatsApp('3001234567', 'Hola')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('no configurados')
  })

  it('retorna error con teléfono inválido (menos de 10 dígitos)', async () => {
    process.env.WHATSAPP_TOKEN = 'token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123'
    const result = await enviarMensajeWhatsApp('12345', 'Hola')
    expect(result.ok).toBe(false)
    expect(result.error).toContain('Teléfono inválido')
  })

  it('envía mensaje correctamente cuando la API responde OK', async () => {
    process.env.WHATSAPP_TOKEN = 'test_token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = 'phone_123'

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'wamid.xxx' }] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await enviarMensajeWhatsApp('+573001234567', 'Hola caficultor')
    expect(result.ok).toBe(true)
    expect(mockFetch).toHaveBeenCalledOnce()

    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('phone_123/messages')
    expect(opts.method).toBe('POST')

    const body = JSON.parse(opts.body)
    expect(body.messaging_product).toBe('whatsapp')
    expect(body.to).toBe('573001234567')
    expect(body.text.body).toBe('Hola caficultor')
  })

  it('retorna error cuando la API de Meta falla', async () => {
    process.env.WHATSAPP_TOKEN = 'test_token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = 'phone_123'

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Invalid token' } }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const result = await enviarMensajeWhatsApp('3001234567', 'Test')
    expect(result.ok).toBe(false)
    expect(result.error).toBe('Invalid token')
  })

  it('limpia caracteres no numéricos del teléfono', async () => {
    process.env.WHATSAPP_TOKEN = 'token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = 'phone_id'

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
    vi.stubGlobal('fetch', mockFetch)

    await enviarMensajeWhatsApp('+57 300-123-4567', 'Hola')
    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.to).toBe('573001234567')
  })
})
