import { createAdminClient } from '@/lib/supabase/admin'
import {
  buildSoilInterpretation,
  buildSoilRecommendation,
  buildSoilRecommendationText,
  type SoilInputValues,
} from '@/lib/suelo/interpretation'
import type { ToolContext } from './registry'

export async function interpretarAnalisisSuelo(
  input: Record<string, unknown>,
  contexto: ToolContext
): Promise<unknown> {
  const userId = String(input.usuario_id ?? contexto.farmerId)
  const farmId = String(input.finca_id ?? '')
  const plotId = input.lote_id != null ? String(input.lote_id) : undefined
  const valores = (input.valores ?? {}) as SoilInputValues

  const interpretation = buildSoilInterpretation(valores)
  if (interpretation.length === 0) {
    return { error: 'No se encontraron valores numéricos para interpretar.' }
  }

  const recommendation = buildSoilRecommendation(valores)
  const recommendationText = buildSoilRecommendationText(recommendation)

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('soil_analysis')
    .insert({
      user_id: userId,
      farm_id: farmId || null,
      plot_id: plotId ?? null,
      input_channel: contexto.channel,
      ph: valores.ph ?? null,
      organic_matter: valores.materia_organica ?? null,
      phosphorus: valores.fosforo ?? null,
      potassium: valores.potasio ?? null,
      calcium: valores.calcio ?? null,
      magnesium: valores.magnesio ?? null,
      aluminum: valores.aluminio ?? null,
      sulfur: valores.azufre ?? null,
      iron: valores.hierro ?? null,
      copper: valores.cobre ?? null,
      manganese: valores.manganeso ?? null,
      zinc: valores.zinc ?? null,
      boron: valores.boro ?? null,
      cec: valores.cice ?? null,
      interpretation,
      recommendation,
      recommendation_text: recommendationText,
    })
    .select('id')
    .maybeSingle()

  if (error) {
    return { error: 'No fue posible guardar el análisis de suelo.' }
  }

  return {
    analisis_id: data?.id,
    interpretacion: interpretation,
    recomendacion: recommendation,
    recomendacion_texto: recommendationText,
  }
}
