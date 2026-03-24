import { describe, it, expect } from 'vitest'
import {
  buildSoilInterpretation,
  buildSoilRecommendation,
  buildSoilRecommendationText,
} from './interpretation'

describe('soil interpretation', () => {
  it('clasifica nutrientes con los niveles esperados', () => {
    const out = buildSoilInterpretation({
      ph: 4.8,
      fosforo: 18,
      potasio: 0.5,
      magnesio: 0.3,
    })

    expect(out).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nutriente: 'ph', nivel: 'bajo' }),
        expect.objectContaining({ nutriente: 'fosforo', nivel: 'medio' }),
        expect.objectContaining({ nutriente: 'potasio', nivel: 'alto' }),
        expect.objectContaining({ nutriente: 'magnesio', nivel: 'bajo' }),
      ])
    )
  })

  it('recomienda grado con Mg y S cuando hay deficiencia', () => {
    const out = buildSoilRecommendation({
      magnesio: 0.2,
      azufre: 8,
    })

    expect(out.grade).toBe('23-4-20-3-4')
    expect(out.suggestedProductSearch).toBe('23-4-20-3-4')
  })

  it('recomienda grado balanceado cuando no hay déficit de Mg/S', () => {
    const out = buildSoilRecommendation({
      magnesio: 0.9,
      azufre: 15,
    })

    expect(out.grade).toBe('26-4-22')
  })

  it('genera texto de recomendación legible', () => {
    const text = buildSoilRecommendationText({
      grade: '26-4-22',
      composition: 'N-P-K',
      doseKgHaYear: 1164,
      splitPerYear: 2,
      reason: 'Prueba',
      suggestedProductSearch: '26-4-22',
    })

    expect(text).toContain('26-4-22')
    expect(text).toContain('1164')
    expect(text).toContain('2 aplicaciones')
  })
})
