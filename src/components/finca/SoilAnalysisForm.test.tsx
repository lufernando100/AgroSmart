import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SoilAnalysisForm } from './SoilAnalysisForm'

describe('SoilAnalysisForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deshabilita envío si finca está vacía', async () => {
    render(<SoilAnalysisForm />)
    expect(screen.getByText('Interpretar análisis')).toBeDisabled()
  })

  it('muestra error con valor no numérico', async () => {
    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: 'bbbbbbbb-0000-4000-8000-000000000001' },
    })
    fireEvent.change(screen.getByLabelText('pH'), { target: { value: 'abc' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/numéricos/i)
    })
  })

  it('renderiza resultado cuando API responde ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'soil-1',
            interpretation: [{ nutriente: 'ph', valor: 5.1, nivel: 'medio' }],
            recommendation: {
              grade: '26-4-22',
              doseKgHaYear: 1164,
              splitPerYear: 2,
              suggestedProductSearch: '26-4-22',
            },
            recommendation_text: 'Recomendación de prueba',
          }),
      })
    )

    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: 'bbbbbbbb-0000-4000-8000-000000000001' },
    })
    fireEvent.change(screen.getByLabelText('pH'), { target: { value: '5.1' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      expect(screen.getByText('Resultado')).toBeInTheDocument()
      expect(screen.getByText('Recomendación de prueba')).toBeInTheDocument()
      expect(screen.getByText(/26-4-22/)).toBeInTheDocument()
    })
  })
})
