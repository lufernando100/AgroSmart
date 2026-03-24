import { GRADOS_CENICAFE, clasificarNutriente } from '@/lib/cenicafe/tablas'

export type SoilInputValues = {
  ph?: number
  materia_organica?: number
  fosforo?: number
  potasio?: number
  calcio?: number
  magnesio?: number
  aluminio?: number
  azufre?: number
  hierro?: number
  cobre?: number
  manganeso?: number
  zinc?: number
  boro?: number
  cice?: number
}

export type SoilLevel = 'bajo' | 'medio' | 'alto'

export type SoilInterpretationItem = {
  nutriente: keyof SoilInputValues
  valor: number
  nivel: SoilLevel
}

export type SoilRecommendation = {
  grade: string
  composition: string
  doseKgHaYear: number
  splitPerYear: number
  reason: string
  suggestedProductSearch: string
}

const NUTRIENTS_IN_ORDER: (keyof SoilInputValues)[] = [
  'ph',
  'materia_organica',
  'fosforo',
  'potasio',
  'calcio',
  'magnesio',
  'aluminio',
  'azufre',
  'hierro',
  'cobre',
  'manganeso',
  'zinc',
  'boro',
  'cice',
]

function asNumberOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) return null
  return value
}

export function buildSoilInterpretation(values: SoilInputValues): SoilInterpretationItem[] {
  const rows: SoilInterpretationItem[] = []

  for (const nutrient of NUTRIENTS_IN_ORDER) {
    const value = asNumberOrNull(values[nutrient])
    if (value === null) continue
    rows.push({
      nutriente: nutrient,
      valor: value,
      nivel: clasificarNutriente(nutrient, value),
    })
  }

  return rows
}

export function buildSoilRecommendation(values: SoilInputValues): SoilRecommendation {
  const lowMg = typeof values.magnesio === 'number' && values.magnesio < 0.5
  const lowS = typeof values.azufre === 'number' && values.azufre < 10
  const needsMgAndS = lowMg || lowS

  const grade = needsMgAndS ? GRADOS_CENICAFE[1] : GRADOS_CENICAFE[0]

  return {
    grade: grade.grado,
    composition: grade.composicion,
    doseKgHaYear: grade.dosis_kg_ha_anio,
    splitPerYear: grade.fraccionamiento,
    reason: needsMgAndS
      ? 'Se recomienda este grado porque el suelo está bajo en magnesio y/o azufre.'
      : 'Se recomienda este grado por balance general de nutrientes en el análisis.',
    suggestedProductSearch: grade.grado,
  }
}

export function buildSoilRecommendationText(recommendation: SoilRecommendation): string {
  return `Grado recomendado: ${recommendation.grade}. Dosis: ${recommendation.doseKgHaYear} kg/ha/año, dividido en ${recommendation.splitPerYear} aplicaciones. ${recommendation.reason}`
}
