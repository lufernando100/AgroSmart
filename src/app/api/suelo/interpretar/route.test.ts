import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { POST } from './route'

const USER_ID = 'aaaaaaaa-0000-4000-8000-000000000001'
const FARM_ID = 'bbbbbbbb-0000-4000-8000-000000000001'
const PLOT_ID = 'cccccccc-0000-4000-8000-000000000001'

function makeSupabaseMock(overrides?: {
  user?: { id: string } | null
  insertError?: { code?: string; message?: string } | null
}) {
  const state = {
    payload: null as unknown,
  }

  const queryBuilder = {
    insert: vi.fn((payload: unknown) => {
      state.payload = payload
      return queryBuilder
    }),
    select: vi.fn(() => queryBuilder),
    single: vi.fn().mockResolvedValue(
      overrides?.insertError
        ? { data: null, error: overrides.insertError }
        : { data: { id: 'soil-1' }, error: null }
    ),
  }

  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: overrides?.user === undefined ? { id: USER_ID } : overrides.user },
      }),
    },
    from: vi.fn(() => queryBuilder),
  }

  return { supabase, state }
}

describe('POST /api/suelo/interpretar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 401 cuando no hay usuario autenticado', async () => {
    const { supabase } = makeSupabaseMock({ user: null })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const res = await POST(
      new Request('http://localhost/api/suelo/interpretar', {
        method: 'POST',
        body: JSON.stringify({ farm_id: FARM_ID, valores: { ph: 5.2 } }),
      })
    )

    expect(res.status).toBe(401)
  })

  it('valida farm_id inválido', async () => {
    const { supabase } = makeSupabaseMock()
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const res = await POST(
      new Request('http://localhost/api/suelo/interpretar', {
        method: 'POST',
        body: JSON.stringify({ farm_id: 'bad-id', valores: { ph: 5.2 } }),
      })
    )

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.stringMatching(/farm_id/i) })
    )
  })

  it('guarda análisis y devuelve interpretación + recomendación', async () => {
    const { supabase, state } = makeSupabaseMock()
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const res = await POST(
      new Request('http://localhost/api/suelo/interpretar', {
        method: 'POST',
        body: JSON.stringify({
          farm_id: FARM_ID,
          plot_id: PLOT_ID,
          valores: { ph: 4.9, magnesio: 0.2, azufre: 8, fosforo: 20 },
        }),
      })
    )

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('soil-1')
    expect(body.recommendation.grade).toBe('23-4-20-3-4')
    expect(state.payload).toEqual(
      expect.objectContaining({
        user_id: USER_ID,
        farm_id: FARM_ID,
        plot_id: PLOT_ID,
      })
    )
  })

  it('mapea error de BD a mensaje amigable', async () => {
    const { supabase } = makeSupabaseMock({
      insertError: {
        code: '23503',
        message: 'violates foreign key constraint "soil_analysis_farm_id_fkey"',
      },
    })
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const res = await POST(
      new Request('http://localhost/api/suelo/interpretar', {
        method: 'POST',
        body: JSON.stringify({
          farm_id: FARM_ID,
          valores: { ph: 5.0 },
        }),
      })
    )
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).not.toMatch(/23503|foreign key|soil_analysis/i)
  })
})
