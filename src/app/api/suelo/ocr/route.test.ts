import { beforeEach, describe, expect, it, vi } from 'vitest'

// vi.hoisted runs BEFORE any imports, so the reference is valid inside vi.mock factories
const { mockMessagesCreate, mockGenerateContent } = vi.hoisted(() => ({
  mockMessagesCreate: vi.fn(),
  mockGenerateContent: vi.fn(),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  // Must use regular function (not arrow) so it can be called with `new`
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: mockMessagesCreate } }
  }),
}))

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(function () {
    return {
      getGenerativeModel: vi.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    }
  }),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { POST } from './route'

const USER_ID = 'aaaaaaaa-0000-4000-8000-000000000001'

// Minimal valid base64 image (1×1 JPEG)
const FAKE_IMAGE_B64 =
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAAREAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEA//EAB0QAAICAwEBAQAAAAAAAAAAAAECAAMEERIhMf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDJ1ixYsWLFi//Z'

function makeSupabaseMock(userId: string | null = USER_ID) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
      }),
    },
  }
}

function makeAdminMock(opts?: { uploadError?: boolean }) {
  const uploadResult = opts?.uploadError
    ? { data: null, error: { message: 'bucket not found' } }
    : { data: { path: `${USER_ID}/123.jpg` }, error: null }

  return {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue(uploadResult),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/soil-images/test.jpg' },
        }),
      }),
    },
  }
}

describe('POST /api/suelo/ocr', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
  })

  it('retorna 401 si no hay sesión', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock(null) as never)

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: 'image/jpeg' }),
      })
    )

    expect(res.status).toBe(401)
  })

  it('retorna 400 si falta image', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ media_type: 'image/jpeg' }),
      })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/imagen/i)
  })

  it('retorna 400 con media_type no soportado', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: 'image/bmp' }),
      })
    )

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/tipo de imagen/i)
  })

  it('extrae valores y devuelve image_url cuando todo va bien', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)
    vi.mocked(createAdminClient).mockReturnValue(makeAdminMock() as never)
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"ph": 5.2, "fosforo": 18, "magnesio": 0.4}' }],
    })

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: 'image/jpeg' }),
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.values).toEqual({ ph: 5.2, fosforo: 18, magnesio: 0.4 })
    expect(body.image_url).toBe('https://example.com/soil-images/test.jpg')
  })

  it('devuelve values aunque falle la subida a Storage', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)
    vi.mocked(createAdminClient).mockReturnValue(makeAdminMock({ uploadError: true }) as never)
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"ph": 5.2}' }],
    })

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: 'image/jpeg' }),
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.values).toEqual({ ph: 5.2 })
    expect(body.image_url).toBeNull()
  })

  it('retorna 422 si Claude no puede extraer valores (respuesta inválida)', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)
    vi.mocked(createAdminClient).mockReturnValue(makeAdminMock() as never)
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'No se encontraron valores en esta imagen.' }],
    })

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: 'image/jpeg' }),
      })
    )

    expect(res.status).toBe(422)
    const body = await res.json()
    expect(body.error).toMatch(/legible|análisis/i)
  })

  it('maneja JSON con code fences de markdown', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)
    vi.mocked(createAdminClient).mockReturnValue(makeAdminMock() as never)
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n{"ph": 6.1, "potasio": 0.5}\n```' }],
    })

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: 'image/jpeg' }),
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.values.ph).toBe(6.1)
    expect(body.values.potasio).toBe(0.5)
  })

  it('ignora claves desconocidas en la respuesta de Claude', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)
    vi.mocked(createAdminClient).mockReturnValue(makeAdminMock() as never)
    mockMessagesCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"ph": 5.5, "unknown_field": 99, "magnesio": 0.6}' }],
    })

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: 'image/jpeg' }),
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.values).toEqual({ ph: 5.5, magnesio: 0.6 })
    expect(body.values.unknown_field).toBeUndefined()
  })

  it('acepta image/png y image/webp como media_type válidos', async () => {
    for (const mediaType of ['image/png', 'image/webp'] as const) {
      vi.clearAllMocks()
      vi.stubEnv('ANTHROPIC_API_KEY', 'test-key')
      vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)
      vi.mocked(createAdminClient).mockReturnValue(makeAdminMock() as never)
      mockMessagesCreate.mockResolvedValue({
        content: [{ type: 'text', text: '{"ph": 5.0}' }],
      })

      const res = await POST(
        new Request('http://localhost/api/suelo/ocr', {
          method: 'POST',
          body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: mediaType }),
        })
      )

      expect(res.status).toBe(200)
    }
  })

  it('retorna 500 si SOIL_OCR_PROVIDER=google y no hay clave de Google', async () => {
    vi.stubEnv('SOIL_OCR_PROVIDER', 'google')
    vi.stubEnv('GOOGLE_API_KEY', '')
    vi.stubEnv('GEMINI_API_KEY', '')
    vi.stubEnv('LLM_API_KEY', '')
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: 'image/jpeg' }),
      })
    )

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toMatch(/configurado/i)
  })

  it('usa Gemini cuando SOIL_OCR_PROVIDER=google y hay GOOGLE_API_KEY', async () => {
    vi.stubEnv('SOIL_OCR_PROVIDER', 'google')
    vi.stubEnv('GOOGLE_API_KEY', 'test-google')
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as never)
    vi.mocked(createAdminClient).mockReturnValue(makeAdminMock() as never)
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '{"ph": 5.2, "fosforo": 18}',
      },
    })

    const res = await POST(
      new Request('http://localhost/api/suelo/ocr', {
        method: 'POST',
        body: JSON.stringify({ image: FAKE_IMAGE_B64, media_type: 'image/jpeg' }),
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.values).toEqual({ ph: 5.2, fosforo: 18 })
    expect(mockGenerateContent).toHaveBeenCalled()
    expect(mockMessagesCreate).not.toHaveBeenCalled()
  })
})
