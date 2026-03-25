import { NextResponse } from 'next/server'

/**
 * Readiness: Supabase REST (anon) + optional WhatsApp env / Graph probe.
 * Protected with HEALTH_CHECK_SECRET (Bearer). Set the same value in Vercel and GitHub Actions.
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Checks = {
  supabase_url_set: boolean
  supabase_anon_set: boolean
  supabase_rest: boolean
  whatsapp_token_set: boolean
  whatsapp_phone_id_set: boolean
  whatsapp_graph?: boolean
}

export async function GET(request: Request) {
  const secret = process.env.HEALTH_CHECK_SECRET?.trim()
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'health_secret_not_configured' },
      { status: 503 }
    )
  }

  const auth = request.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  const checks: Checks = {
    supabase_url_set: Boolean(url),
    supabase_anon_set: Boolean(anon),
    supabase_rest: false,
    whatsapp_token_set: Boolean(process.env.WHATSAPP_TOKEN?.trim()),
    whatsapp_phone_id_set: Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()),
  }

  if (url && anon) {
    try {
      const base = url.replace(/\/$/, '')
      const res = await fetch(`${base}/rest/v1/categories?select=id&limit=1`, {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
        signal: AbortSignal.timeout(12_000),
      })
      checks.supabase_rest = res.ok
    } catch {
      checks.supabase_rest = false
    }
  }

  const { searchParams } = new URL(request.url)
  if (searchParams.get('probe_whatsapp') === '1') {
    const token = process.env.WHATSAPP_TOKEN?.trim()
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
    if (token && phoneId) {
      try {
        const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(15_000),
        })
        checks.whatsapp_graph = res.ok
      } catch {
        checks.whatsapp_graph = false
      }
    } else {
      checks.whatsapp_graph = false
    }
  }

  const supabaseOk = checks.supabase_rest
  const whatsappEnvOk = checks.whatsapp_token_set && checks.whatsapp_phone_id_set
  const warnings: string[] = []
  if (!whatsappEnvOk) warnings.push('whatsapp_env_incomplete')

  const ok = supabaseOk
  const status = ok ? 200 : 503

  return NextResponse.json(
    {
      ok,
      supabase_ok: supabaseOk,
      whatsapp_env_ok: whatsappEnvOk,
      warnings,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}
