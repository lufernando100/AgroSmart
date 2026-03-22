import { describe, it, expect, vi, afterEach } from 'vitest'
import { formatCOP, formatFecha, formatRelativo, formatKm } from './format'

describe('formatCOP', () => {
  it('formatea valor positivo en COP', () => {
    const result = formatCOP(182000)
    // Intl puede usar diferentes separadores según el entorno
    expect(result).toContain('182')
    expect(result).toContain('000')
  })

  it('formatea cero', () => {
    const result = formatCOP(0)
    expect(result).toContain('0')
  })

  it('formatea valores grandes', () => {
    const result = formatCOP(1500000)
    expect(result).toContain('1')
    expect(result).toContain('500')
    expect(result).toContain('000')
  })

  it('no incluye decimales', () => {
    const result = formatCOP(100)
    expect(result).not.toContain('.')
  })
})

describe('formatFecha', () => {
  it('formatea fecha ISO en español', () => {
    const result = formatFecha('2026-03-21')
    expect(result).toContain('2026')
    expect(result.toLowerCase()).toContain('marzo')
  })

  it('acepta objeto Date', () => {
    const result = formatFecha(new Date(2026, 0, 15))
    expect(result).toContain('2026')
    expect(result.toLowerCase()).toContain('enero')
  })
})

describe('formatRelativo', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra minutos para diferencias < 1 hora', () => {
    const ahora = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(ahora)
    const hace30min = new Date(ahora - 30 * 60 * 1000).toISOString()
    expect(formatRelativo(hace30min)).toBe('hace 30 min')
  })

  it('muestra horas para diferencias < 24 horas', () => {
    const ahora = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(ahora)
    const hace3h = new Date(ahora - 3 * 60 * 60 * 1000).toISOString()
    expect(formatRelativo(hace3h)).toBe('hace 3 horas')
  })

  it('muestra hora singular', () => {
    const ahora = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(ahora)
    const hace1h = new Date(ahora - 1 * 60 * 60 * 1000).toISOString()
    expect(formatRelativo(hace1h)).toBe('hace 1 hora')
  })

  it('muestra días para diferencias >= 24 horas', () => {
    const ahora = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(ahora)
    const hace2d = new Date(ahora - 2 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativo(hace2d)).toBe('hace 2 días')
  })

  it('muestra día singular', () => {
    const ahora = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(ahora)
    const hace1d = new Date(ahora - 1 * 24 * 60 * 60 * 1000).toISOString()
    expect(formatRelativo(hace1d)).toBe('hace 1 día')
  })
})

describe('formatKm', () => {
  it('formatea con un decimal', () => {
    expect(formatKm(2.345)).toBe('2.3 km')
  })

  it('formatea cero', () => {
    expect(formatKm(0)).toBe('0.0 km')
  })

  it('formatea valor entero', () => {
    expect(formatKm(5)).toBe('5.0 km')
  })
})
