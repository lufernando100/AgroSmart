import { describe, it, expect, vi, afterEach } from 'vitest'
import { GET } from './route'

describe('GET /api/health/ready', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('503 when HEALTH_CHECK_SECRET is not set', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', '')
    const res = await GET(new Request('http://localhost/api/health/ready'))
    expect(res.status).toBe(503)
  })

  it('401 without Authorization bearer', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'my-health-secret')
    const res = await GET(new Request('http://localhost/api/health/ready'))
    expect(res.status).toBe(401)
  })

  it('401 with wrong bearer', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'correct')
    const res = await GET(
      new Request('http://localhost/api/health/ready', {
        headers: { Authorization: 'Bearer wrong' },
      })
    )
    expect(res.status).toBe(401)
  })

  it('200 when Supabase REST succeeds (whatsapp env optional)', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'secret')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
    vi.stubEnv('WHATSAPP_TOKEN', '')
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('[]', { status: 200 }))
    )

    const res = await GET(
      new Request('http://localhost/api/health/ready', {
        headers: { Authorization: 'Bearer secret' },
      })
    )

    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean; supabase_ok: boolean; warnings: string[] }
    expect(body.ok).toBe(true)
    expect(body.supabase_ok).toBe(true)
    expect(body.warnings).toContain('whatsapp_env_incomplete')
  })

  it('503 when Supabase REST fails', async () => {
    vi.stubEnv('HEALTH_CHECK_SECRET', 'secret')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('err', { status: 500 }))
    )

    const res = await GET(
      new Request('http://localhost/api/health/ready', {
        headers: { Authorization: 'Bearer secret' },
      })
    )

    expect(res.status).toBe(503)
    const body = (await res.json()) as { ok: boolean }
    expect(body.ok).toBe(false)
  })
})
