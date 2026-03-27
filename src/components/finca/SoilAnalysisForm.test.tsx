import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SoilAnalysisForm } from './SoilAnalysisForm'

const FARM_UUID = 'bbbbbbbb-0000-4000-8000-000000000001'

type SoilNivel = 'bajo' | 'medio' | 'alto'
type SoilInterpretationRow = {
  nutriente: string
  valor: number
  nivel: SoilNivel
}

type SoilSuccessResponse = {
  id: string
  interpretation: SoilInterpretationRow[]
  recommendation: {
    grade: string
    doseKgHaYear: number
    splitPerYear: number
    suggestedProductSearch: string
  }
  recommendation_text: string
}

const SUCCESS_RESPONSE: SoilSuccessResponse = {
  id: 'soil-1',
  interpretation: [{ nutriente: 'ph', valor: 5.1, nivel: 'medio' }],
  recommendation: {
    grade: '26-4-22',
    doseKgHaYear: 1164,
    splitPerYear: 2,
    suggestedProductSearch: '26-4-22',
  },
  recommendation_text: 'Recomendación de prueba',
}

function mockFetchSuccess(response = SUCCESS_RESPONSE) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    })
  )
}

function mockFetchError(error = 'Error del servidor') {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error }),
    })
  )
}

describe('SoilAnalysisForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- Validaciones básicas ---

  it('deshabilita envío si finca está vacía', () => {
    render(<SoilAnalysisForm />)
    expect(screen.getByText('Interpretar análisis')).toBeDisabled()
  })

  it('muestra error con valor no numérico', async () => {
    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: FARM_UUID },
    })
    fireEvent.change(screen.getByLabelText('pH'), { target: { value: 'abc' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/numéricos/i)
    })
  })

  it('muestra error si no se ingresa ningún valor', async () => {
    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: FARM_UUID },
    })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/al menos un valor/i)
    })
  })

  // --- Render de resultado ---

  it('renderiza resultado cuando API responde ok', async () => {
    mockFetchSuccess()

    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: FARM_UUID },
    })
    fireEvent.change(screen.getByLabelText('pH'), { target: { value: '5.1' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      expect(screen.getByText('Resultado')).toBeInTheDocument()
      expect(screen.getByText('Recomendación de prueba')).toBeInTheDocument()
    })
  })

  it('muestra error del servidor en alerta accesible', async () => {
    mockFetchError('No fue posible interpretar el análisis.')

    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: FARM_UUID },
    })
    fireEvent.change(screen.getByLabelText('pH'), { target: { value: '5.1' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/No fue posible/i)
    })
  })

  // --- 14 campos ---

  it('muestra los 14 campos de nutrientes', () => {
    render(<SoilAnalysisForm />)
    const expectedLabels = [
      'pH',
      'Materia orgánica (%)',
      'Fósforo (mg/kg)',
      'Potasio (cmol/kg)',
      'Calcio (cmol/kg)',
      'Magnesio (cmol/kg)',
      'Aluminio (cmol/kg)',
      'Azufre (mg/kg)',
      'Hierro (mg/kg)',
      'Cobre (mg/kg)',
      'Manganeso (mg/kg)',
      'Zinc (mg/kg)',
      'Boro (mg/kg)',
      'CICE (cmol/kg)',
    ]
    for (const label of expectedLabels) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
  })

  // --- Semáforo de colores ---

  it('aplica clase roja para nivel bajo', async () => {
    mockFetchSuccess({
      ...SUCCESS_RESPONSE,
      interpretation: [{ nutriente: 'magnesio', valor: 0.2, nivel: 'bajo' }],
    })

    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: FARM_UUID },
    })
    fireEvent.change(screen.getByLabelText('Magnesio (cmol/kg)'), { target: { value: '0.2' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      const cell = screen.getByText('bajo')
      expect(cell.className).toMatch(/red/)
    })
  })

  it('aplica clase ámbar para nivel medio', async () => {
    mockFetchSuccess({
      ...SUCCESS_RESPONSE,
      interpretation: [{ nutriente: 'ph', valor: 5.2, nivel: 'medio' }],
    })

    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: FARM_UUID },
    })
    fireEvent.change(screen.getByLabelText('pH'), { target: { value: '5.2' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      const cell = screen.getByText('medio')
      expect(cell.className).toMatch(/amber/)
    })
  })

  it('aplica clase verde para nivel alto', async () => {
    mockFetchSuccess({
      ...SUCCESS_RESPONSE,
      interpretation: [{ nutriente: 'fosforo', valor: 30, nivel: 'alto' }],
    })

    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: FARM_UUID },
    })
    fireEvent.change(screen.getByLabelText('Fósforo (mg/kg)'), { target: { value: '30' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      const cell = screen.getByText('alto')
      expect(cell.className).toMatch(/green/)
    })
  })

  // --- Deep-link al catálogo ---

  it('muestra botón con link al catálogo con el grado sugerido', async () => {
    mockFetchSuccess()

    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: FARM_UUID },
    })
    fireEvent.change(screen.getByLabelText('pH'), { target: { value: '5.1' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Ver precios de 26-4-22/i })
      expect(link).toHaveAttribute('href', '/catalogo?q=26-4-22')
    })
  })

  it('codifica caracteres especiales en el deep-link', async () => {
    mockFetchSuccess({
      ...SUCCESS_RESPONSE,
      recommendation: {
        ...SUCCESS_RESPONSE.recommendation,
        suggestedProductSearch: '25-4-24 + Mg',
        grade: '25-4-24 + Mg',
      },
    })

    render(<SoilAnalysisForm />)
    fireEvent.change(screen.getByPlaceholderText('UUID de la finca'), {
      target: { value: FARM_UUID },
    })
    fireEvent.change(screen.getByLabelText('pH'), { target: { value: '5.1' } })
    fireEvent.click(screen.getByText('Interpretar análisis'))

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Ver precios/i })
      expect(link.getAttribute('href')).toContain(encodeURIComponent('25-4-24 + Mg'))
    })
  })

  // --- OCR: botón de foto ---

  it('muestra botón de subir foto', () => {
    render(<SoilAnalysisForm />)
    expect(screen.getByText('Subir foto del análisis')).toBeInTheDocument()
  })

  it('pre-llena campos con valores extraídos por OCR', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            values: { ph: 5.4, magnesio: 0.3 },
            image_url: 'https://example.com/foto.jpg',
          }),
      })
    )

    // FileReader mock: result must be set on the instance so fileToBase64 can read it
    const MOCK_DATA_URL = 'data:image/jpeg;base64,/9j/test=='
    vi.stubGlobal(
      'FileReader',
      vi.fn().mockImplementation(function (this: {
        result: string
        onload: (() => void) | null
        onerror: (() => void) | null
        readAsDataURL: (file: File) => void
      }) {
        this.result = MOCK_DATA_URL
        this.onload = null
        this.onerror = null
        this.readAsDataURL = () => {
          // Defer to let fileToBase64 set this.onload first
          setTimeout(() => this.onload?.(), 0)
        }
      })
    )

    render(<SoilAnalysisForm />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const fakeFile = new File(['fake'], 'analisis.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [fakeFile] } })

    await waitFor(
      () => {
        const phInput = screen.getByLabelText('pH') as HTMLInputElement
        expect(phInput.value).toBe('5.4')
      },
      { timeout: 3000 }
    )

    const mgInput = screen.getByLabelText('Magnesio (cmol/kg)') as HTMLInputElement
    expect(mgInput.value).toBe('0.3')
  })

  it('muestra error de OCR si la API falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({ error: 'No pudimos leer los valores del análisis.' }),
      })
    )

    const MOCK_DATA_URL = 'data:image/jpeg;base64,/9j/test=='
    vi.stubGlobal(
      'FileReader',
      vi.fn().mockImplementation(function (this: {
        result: string
        onload: (() => void) | null
        onerror: (() => void) | null
        readAsDataURL: (file: File) => void
      }) {
        this.result = MOCK_DATA_URL
        this.onload = null
        this.onerror = null
        this.readAsDataURL = () => {
          setTimeout(() => this.onload?.(), 0)
        }
      })
    )

    render(<SoilAnalysisForm />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const fakeFile = new File(['fake'], 'foto.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [fakeFile] } })

    await waitFor(
      () => {
        expect(screen.getByRole('alert')).toHaveTextContent(/No pudimos leer/i)
      },
      { timeout: 3000 }
    )
  })
})
