import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

/** Vision OCR for soil lab reports — configured via env, not hardcoded in route handlers. */
export type SoilOcrProvider = 'anthropic' | 'google'

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

export function resolveSoilOcrProvider(): SoilOcrProvider {
  const raw = process.env.SOIL_OCR_PROVIDER?.trim().toLowerCase()
  if (raw === 'google' || raw === 'gemini') return 'google'
  return 'anthropic'
}

/** Model id for the active provider (Anthropic or Gemini). */
export function resolveSoilOcrModel(provider: SoilOcrProvider): string {
  const explicit = process.env.SOIL_OCR_MODEL?.trim()
  if (explicit) return explicit

  if (provider === 'google') {
    return 'gemini-2.0-flash'
  }

  // Anthropic: backward compat with older env name
  const legacyAnthropic = process.env.ANTHROPIC_OCR_MODEL?.trim()
  if (legacyAnthropic) return legacyAnthropic

  return 'claude-sonnet-4-20250514'
}

export function resolveAnthropicApiKey(): string | null {
  const k = process.env.ANTHROPIC_API_KEY?.trim()
  return k || null
}

/** Same pattern as llmWhatsApp for Google provider. */
export function resolveGoogleApiKeyForOcr(): string | null {
  const k =
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.LLM_API_KEY?.trim()
  return k || null
}

type VisionMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

export async function extractSoilOcrRawText(params: {
  provider: SoilOcrProvider
  model: string
  imageBase64: string
  mediaType: VisionMediaType
}): Promise<string> {
  const { provider, model, imageBase64, mediaType } = params

  if (provider === 'google') {
    const apiKey = resolveGoogleApiKeyForOcr()
    if (!apiKey) {
      throw new Error('MISSING_GOOGLE_KEY')
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    const genModel = genAI.getGenerativeModel({ model })
    const result = await genModel.generateContent([
      EXTRACTION_PROMPT,
      {
        inlineData: {
          mimeType: mediaType,
          data: imageBase64,
        },
      },
    ])
    const text = result.response.text()
    return text
  }

  const apiKey = resolveAnthropicApiKey()
  if (!apiKey) {
    throw new Error('MISSING_ANTHROPIC_KEY')
  }

  const anthropic = new Anthropic({ apiKey })
  const message = await anthropic.messages.create({
    model,
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
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
  return responseText
}

/** User-facing Spanish when OCR throws (no raw JSON). */
export function friendlySoilOcrError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (msg === 'MISSING_GOOGLE_KEY' || msg === 'MISSING_ANTHROPIC_KEY') {
    return 'Servicio de análisis no configurado. Contactá soporte.'
  }
  const lower = msg.toLowerCase()
  if (lower.includes('not_found') && lower.includes('model')) {
    return 'El modelo de IA para leer la foto no está disponible. Actualizá la configuración en el servidor.'
  }
  if (lower.includes('api key') || lower.includes('invalid api key')) {
    return 'Clave de IA inválida o no autorizada. Revisá la configuración del servidor.'
  }
  return 'No pudimos leer la imagen con el servicio configurado. Probá otra foto o ingresá los valores manualmente.'
}
