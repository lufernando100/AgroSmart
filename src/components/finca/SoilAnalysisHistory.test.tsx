import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/components/ui/MensajeVacio', () => ({
  MensajeVacio: ({ title }: { title: string }) => <div data-testid="vacio">{title}</div>,
}))

import { createClient } from '@/lib/supabase/server'
import { SoilAnalysisHistory } from './SoilAnalysisHistory'

const USER_ID = 'aaaaaaaa-0000-4000-8000-000000000001'

function makeSupabaseMock(rows: unknown[] = []) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: USER_ID } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: rows, error: null }),
    }),
  }
}

describe('SoilAnalysisHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('muestra estado vacío cuando no hay análisis', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock([]) as never)

    render(await SoilAnalysisHistory())

    expect(screen.getByTestId('vacio')).toHaveTextContent(/Sin análisis anteriores/i)
  })

  it('retorna null si no hay usuario autenticado', async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)

    const result = await SoilAnalysisHistory()
    expect(result).toBeNull()
  })

  it('renderiza tarjetas con fecha y grado para cada análisis', async () => {
    const rows = [
      {
        id: 'soil-1',
        created_at: '2026-03-20T10:00:00Z',
        recommendation_text: 'Grado recomendado: 26-4-22. Dosis: 1164 kg/ha/año.',
        recommendation: { grade: '26-4-22' },
      },
      {
        id: 'soil-2',
        created_at: '2026-02-15T08:30:00Z',
        recommendation_text: 'Grado recomendado: 23-4-20-3-4.',
        recommendation: { grade: '23-4-20-3-4' },
      },
    ]
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock(rows) as never)

    render(await SoilAnalysisHistory())

    expect(screen.getByText('26-4-22')).toBeInTheDocument()
    expect(screen.getByText('23-4-20-3-4')).toBeInTheDocument()
    expect(screen.getByText(/Grado recomendado: 26-4-22/)).toBeInTheDocument()
  })

  it('formatea la fecha en español colombiano', async () => {
    const rows = [
      {
        id: 'soil-1',
        created_at: '2026-03-20T10:00:00Z',
        recommendation_text: 'Texto de prueba',
        recommendation: { grade: '26-4-22' },
      },
    ]
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock(rows) as never)

    render(await SoilAnalysisHistory())

    // Date formatted as "20 de marzo de 2026" in es-CO locale
    expect(screen.getByText(/de marzo de 2026/i)).toBeInTheDocument()
  })

  it('muestra "—" como grado cuando recommendation es null', async () => {
    const rows = [
      {
        id: 'soil-1',
        created_at: '2026-03-20T10:00:00Z',
        recommendation_text: 'Sin recomendación',
        recommendation: null,
      },
    ]
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock(rows) as never)

    render(await SoilAnalysisHistory())

    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
