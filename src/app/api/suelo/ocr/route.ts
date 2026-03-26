import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SoilInputValues } from '@/lib/suelo/interpretation'

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

const EXTRACTION_PROMPT = `You are analyzing a soil analysis laboratory report image from Colombia.
Extract ALL nutrient values visible in the report.
Return ONLY a valid JSON object with these exact keys (omit keys not present in the image):
{
  "ph": number,
  "materia_organica": number,
  "fosforo": number,
  "potasio": number,
  "calcio": number,
  "magnesio": number,
  "aluminio": number,
  "azufre": number,
  "hierro": number,
  "cobre": number,
  "manganeso": number,
  "zinc": number,
  "boro": number,
  "cice": number
}
Rules:
- Values must be numbers only (no units, no strings).
- "materia_organica" is the organic matter percentage.
- "fosforo" (phosphorus) may appear as "P", "Fósforo", or "Phosphorus".
- "cice" is the cation exchange capacity (CIC, CICE, CEC).
- If a nutrient is not in the report, omit that key entirely.
- Return ONLY the JSON object — no explanation, no markdown, no code fences.`

function parseSoilJson(text: string): SoilInputValues | null {
  // Strip markdown code fences if model adds them
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

    // Call Claude Vision to extract nutrient values
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Servicio de análisis no configurado.' }, { status: 500 })
    }

    const anthropic = new Anthropic({ apiKey })
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type,
                data: image,
              },
            },
            {
              type: 'text',
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    })

    const responseText =
      message.content[0]?.type === 'text' ? message.content[0].text : ''
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

    // Upload image to Supabase Storage
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
    const message = e instanceof Error ? e.message : 'Error procesando la imagen.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
