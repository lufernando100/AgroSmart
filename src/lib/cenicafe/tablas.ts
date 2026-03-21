// Niveles críticos de nutrientes en suelos cafeteros (Cenicafé)

export interface NivelNutriente {
  bajo: { min: number; max: number } | { condicion: string }
  medio: { min: number; max: number }
  alto: { min: number; max: number } | { condicion: string }
  unidad: string
}

export const NIVELES_CENICAFE: Record<string, { bajo: string; medio: string; alto: string; unidad: string }> = {
  ph:                { bajo: '< 5.0',    medio: '5.0 - 5.5', alto: '> 5.5',  unidad: '-' },
  materia_organica:  { bajo: '< 5',      medio: '5 - 10',    alto: '> 10',   unidad: '%' },
  fosforo:           { bajo: '< 15',     medio: '15 - 30',   alto: '> 30',   unidad: 'mg/kg' },
  potasio:           { bajo: '< 0.20',   medio: '0.20 - 0.40', alto: '> 0.40', unidad: 'cmol/kg' },
  calcio:            { bajo: '< 1.5',    medio: '1.5 - 5.0', alto: '> 5.0',  unidad: 'cmol/kg' },
  magnesio:          { bajo: '< 0.5',    medio: '0.5 - 1.5', alto: '> 1.5',  unidad: 'cmol/kg' },
  aluminio:          { bajo: '> 1.5 crítico', medio: '0.5 - 1.5', alto: '< 0.5', unidad: 'cmol/kg' },
  azufre:            { bajo: '< 10',     medio: '10 - 20',   alto: '> 20',   unidad: 'mg/kg' },
  hierro:            { bajo: '< 25',     medio: '25 - 50',   alto: '> 50',   unidad: 'mg/kg' },
  zinc:              { bajo: '< 2',      medio: '2 - 5',     alto: '> 5',    unidad: 'mg/kg' },
  manganeso:         { bajo: '< 5',      medio: '5 - 10',    alto: '> 10',   unidad: 'mg/kg' },
  cobre:             { bajo: '< 1',      medio: '1 - 3',     alto: '> 3',    unidad: 'mg/kg' },
  boro:              { bajo: '< 0.2',    medio: '0.2 - 0.5', alto: '> 0.5',  unidad: 'mg/kg' },
}

export type NivelClasificacion = 'bajo' | 'medio' | 'alto'

export function clasificarNutriente(
  nutriente: string,
  valor: number
): NivelClasificacion {
  switch (nutriente) {
    case 'ph':
      if (valor < 5.0) return 'bajo'
      if (valor <= 5.5) return 'medio'
      return 'alto'
    case 'materia_organica':
      if (valor < 5) return 'bajo'
      if (valor <= 10) return 'medio'
      return 'alto'
    case 'fosforo':
      if (valor < 15) return 'bajo'
      if (valor <= 30) return 'medio'
      return 'alto'
    case 'potasio':
      if (valor < 0.20) return 'bajo'
      if (valor <= 0.40) return 'medio'
      return 'alto'
    case 'calcio':
      if (valor < 1.5) return 'bajo'
      if (valor <= 5.0) return 'medio'
      return 'alto'
    case 'magnesio':
      if (valor < 0.5) return 'bajo'
      if (valor <= 1.5) return 'medio'
      return 'alto'
    case 'aluminio':
      // Invertido: alto aluminio es malo
      if (valor > 1.5) return 'bajo'  // crítico
      if (valor >= 0.5) return 'medio'
      return 'alto'
    case 'azufre':
      if (valor < 10) return 'bajo'
      if (valor <= 20) return 'medio'
      return 'alto'
    case 'hierro':
      if (valor < 25) return 'bajo'
      if (valor <= 50) return 'medio'
      return 'alto'
    case 'zinc':
      if (valor < 2) return 'bajo'
      if (valor <= 5) return 'medio'
      return 'alto'
    case 'manganeso':
      if (valor < 5) return 'bajo'
      if (valor <= 10) return 'medio'
      return 'alto'
    case 'cobre':
      if (valor < 1) return 'bajo'
      if (valor <= 3) return 'medio'
      return 'alto'
    case 'boro':
      if (valor < 0.2) return 'bajo'
      if (valor <= 0.5) return 'medio'
      return 'alto'
    default:
      return 'medio'
  }
}

// Recomendaciones de grado de fertilizante Cenicafé
export interface RecomendacionFertilizante {
  grado: string
  composicion: string
  dosis_kg_ha_anio: number
  fraccionamiento: number
  condicion: string
}

export const GRADOS_CENICAFE: RecomendacionFertilizante[] = [
  {
    grado: '26-4-22',
    composicion: 'N-P-K',
    dosis_kg_ha_anio: 1164,
    fraccionamiento: 2,
    condicion: 'Suelos con Mg normal y composición balanceada',
  },
  {
    grado: '23-4-20-3-4',
    composicion: 'N-P-K-Mg-S',
    dosis_kg_ha_anio: 1300,
    fraccionamiento: 2,
    condicion: 'Suelos bajos en Mg y S',
  },
]

// Ajuste por porcentaje de sombrio
export function ajustePorSombrio(porcentaje: number): number {
  if (porcentaje <= 44) return 1.0    // dosis completa
  if (porcentaje <= 55) return 0.5    // 50% de la dosis
  return 0                            // no fertilizar
}

// Ajuste por densidad de plantas (base: 5000-6000 plantas/ha)
export function ajustePorDensidad(plantas_ha: number): number {
  if (plantas_ha < 5000) return plantas_ha / 5000
  if (plantas_ha <= 6000) return 1.0
  return Math.min(plantas_ha / 5000, 1.2) // máximo +20%
}
