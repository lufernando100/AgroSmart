import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { friendlyDbError } from '@/lib/utils/db-errors'
import { isUuid } from '@/lib/catalogo/uuid'
import {
  buildSoilInterpretation,
  buildSoilRecommendation,
  buildSoilRecommendationText,
  type SoilInputValues,
} from '@/lib/suelo/interpretation'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function parseValues(raw: unknown): SoilInputValues | null {
  if (!isRecord(raw)) return null

  const values: SoilInputValues = {}
  const fields: (keyof SoilInputValues)[] = [
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

  for (const field of fields) {
    const value = raw[field]
    if (value === undefined || value === null) continue
    if (typeof value !== 'number' || Number.isNaN(value)) return null
    values[field] = value
  }

  return values
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    let json: unknown
    try {
      json = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
    }

    if (!isRecord(json)) {
      return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 })
    }

    const farmId = json.farm_id
    if (typeof farmId !== 'string' || !isUuid(farmId)) {
      return NextResponse.json({ error: 'farm_id inválido.' }, { status: 400 })
    }

    const plotId = json.plot_id
    if (plotId !== undefined && (typeof plotId !== 'string' || !isUuid(plotId))) {
      return NextResponse.json({ error: 'plot_id inválido.' }, { status: 400 })
    }

    const imageUrl = json.image_url
    if (imageUrl !== undefined && (typeof imageUrl !== 'string' || !imageUrl.trim())) {
      return NextResponse.json({ error: 'image_url inválido.' }, { status: 400 })
    }

    const values = parseValues(json.valores)
    if (!values) {
      return NextResponse.json(
        { error: 'Los valores del análisis son inválidos.' },
        { status: 400 }
      )
    }

    const interpretation = buildSoilInterpretation(values)
    if (interpretation.length === 0) {
      return NextResponse.json(
        { error: 'Debes enviar al menos un valor del análisis de suelo.' },
        { status: 400 }
      )
    }

    const recommendation = buildSoilRecommendation(values)
    const recommendationText = buildSoilRecommendationText(recommendation)

    const payload = {
      user_id: user.id,
      farm_id: farmId,
      plot_id: plotId ?? null,
      image_url: typeof imageUrl === 'string' ? imageUrl.trim() : null,
      input_channel: 'pwa',
      ph: values.ph ?? null,
      organic_matter: values.materia_organica ?? null,
      phosphorus: values.fosforo ?? null,
      potassium: values.potasio ?? null,
      calcium: values.calcio ?? null,
      magnesium: values.magnesio ?? null,
      aluminum: values.aluminio ?? null,
      sulfur: values.azufre ?? null,
      iron: values.hierro ?? null,
      copper: values.cobre ?? null,
      manganese: values.manganeso ?? null,
      zinc: values.zinc ?? null,
      boron: values.boro ?? null,
      cec: values.cice ?? null,
      interpretation: interpretation,
      recommendation: recommendation,
      recommendation_text: recommendationText,
    }

    const { data, error } = await supabase
      .from('soil_analysis')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: friendlyDbError(error) }, { status: 400 })
    }

    return NextResponse.json({
      id: data.id,
      interpretation,
      recommendation,
      recommendation_text: recommendationText,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : friendlyDbError({})
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
