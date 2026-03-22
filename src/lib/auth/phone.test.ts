import { describe, it, expect } from 'vitest'
import { normalizePhoneCo, phoneForDb } from './phone'

describe('normalizePhoneCo', () => {
  it('normaliza 10 dígitos colombianos (3xx)', () => {
    expect(normalizePhoneCo('3001234567')).toBe('+573001234567')
  })

  it('normaliza con espacios y guiones', () => {
    expect(normalizePhoneCo('300 123 4567')).toBe('+573001234567')
    expect(normalizePhoneCo('300-123-4567')).toBe('+573001234567')
  })

  it('normaliza 12 dígitos con prefijo 57', () => {
    expect(normalizePhoneCo('573001234567')).toBe('+573001234567')
  })

  it('normaliza 13 dígitos con + al inicio', () => {
    expect(normalizePhoneCo('+573001234567')).toBe('+573001234567')
  })

  it('lanza error con número demasiado corto', () => {
    expect(() => normalizePhoneCo('300123')).toThrow('Número inválido')
  })

  it('lanza error con número que no empieza por 3', () => {
    expect(() => normalizePhoneCo('1001234567')).toThrow('Número inválido')
  })

  it('lanza error con string vacío', () => {
    expect(() => normalizePhoneCo('')).toThrow('Número inválido')
  })

  it('lanza error con letras', () => {
    expect(() => normalizePhoneCo('abcdefghij')).toThrow('Número inválido')
  })
})

describe('phoneForDb', () => {
  it('quita el + del inicio', () => {
    expect(phoneForDb('+573001234567')).toBe('573001234567')
  })

  it('no modifica si no tiene +', () => {
    expect(phoneForDb('573001234567')).toBe('573001234567')
  })
})
