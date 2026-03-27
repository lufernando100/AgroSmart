import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SoilInputValues } from '@/lib/suelo/interpretation'
import {
  extractSoilOcrRawText,
  friendlySoilOcrError,
  resolveAnthropicApiKey,
  resolveGoogleApiKeyForOcr,
  resolveSoilOcrModel,
  resolveSoilOcrProvider,
} from '@/lib/suelo/ocr-extract'

const VALID_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
type ValidMediaType = (typeof VALID_MEDIA_TYPES)[number]

function isValidMediaType(t: unknown): t is ValidMediaType {
  return VALID_MEDIA_TYPES.includes(t as ValidMediaType)
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

const NUTRIENT_KEYS: (keyof SoilInputValues)[] = [
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

function parseSoilJson(text: string): SoilInputValues | null {
  const cleaned = text.replace(/```[a-z]*\n?/gi, '').trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return null
  }
  if (!isRecord(parsed)) return null

  const values: SoilInputValues = {}
  for (const key of NUTRIENT_KEYS) {
    const val = parsed[key]
    if (val === undefined || val === null) continue
    const num = Number(val)
    if (!Number.isNaN(num)) {
      values[key] = num
    }
  }
  return Object.keys(values).length > 0 ? values : null
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

    const { image, media_type } = json
    if (typeof image !== 'string' || !image.trim()) {
      return NextResponse.json({ error: 'Se requiere la imagen en base64.' }, { status: 400 })
    }
    if (!isValidMediaType(media_type)) {
      return NextResponse.json(
        { error: 'Tipo de imagen no soportado. Usa JPEG, PNG o WebP.' },
        { status: 400 }
      )
    }

    const provider = resolveSoilOcrProvider()
    const ocrModel = resolveSoilOcrModel(provider)

    if (provider === 'anthropic' && !resolveAnthropicApiKey()) {
      return NextResponse.json(
        { error: 'Servicio de análisis no configurado.' },
        { status: 500 }
      )
    }
    if (provider === 'google' && !resolveGoogleApiKeyForOcr()) {
      return NextResponse.json(
        { error: 'Servicio de análisis no configurado.' },
        { status: 500 }
      )
    }

    let responseText: string
    try {
      responseText = await extractSoilOcrRawText({
        provider,
        model: ocrModel,
        imageBase64: image,
        mediaType: media_type,
      })
    } catch (e) {
      return NextResponse.json(
        { error: friendlySoilOcrError(e) },
        { status: 500 }
      )
    }

    const values = parseSoilJson(responseText)
    if (!values) {
      return NextResponse.json(
        {
          error:
            'No pudimos leer los valores del análisis. Verifica que la foto sea legible e inténtalo de nuevo.',
        },
        { status: 422 }
      )
    }

    let imageUrl: string | null = null
    try {
      const buffer = Buffer.from(image, 'base64')
      const ext = media_type === 'image/png' ? 'png' : media_type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const supabaseAdmin = createAdminClient()
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('soil-images')
        .upload(path, buffer, { contentType: media_type, upsert: false })
      if (!uploadError && uploadData) {
        const { data: urlData } = supabaseAdmin.storage
          .from('soil-images')
          .getPublicUrl(uploadData.path)
        imageUrl = urlData.publicUrl
      }
    } catch {
      // Storage failure is non-fatal; values are still returned
    }

    return NextResponse.json({ values, image_url: imageUrl })
  } catch (e) {
    return NextResponse.json(
      { error: friendlySoilOcrError(e) },
      { status: 500 }
    )
  }
}
