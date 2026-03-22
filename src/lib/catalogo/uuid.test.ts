import { describe, it, expect } from 'vitest'
import { isUuid } from './uuid'

describe('isUuid', () => {
  it('acepta UUID v4 válido', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
  })

  it('acepta UUID en mayúsculas', () => {
    expect(isUuid('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
  })

  it('rechaza string vacío', () => {
    expect(isUuid('')).toBe(false)
  })

  it('rechaza string aleatorio', () => {
    expect(isUuid('no-es-un-uuid')).toBe(false)
  })

  it('rechaza UUID con formato parcial', () => {
    expect(isUuid('550e8400-e29b-41d4-a716')).toBe(false)
  })

  it('rechaza slug tipo cat-fert', () => {
    expect(isUuid('cat-fert')).toBe(false)
  })

  it('rechaza UUID con versión 0 inválida', () => {
    expect(isUuid('550e8400-e29b-01d4-a716-446655440000')).toBe(false)
  })
})
