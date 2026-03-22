import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { normalizePhoneCo } from '@/lib/auth/phone'
import { syncUserAfterAuth } from '@/lib/auth/sync-user'
import type { UserRole } from '@/types/database'

/** Mensaje claro cuando Supabase rechaza el OTP (expiró, ya usado o no coincide). */
function friendlyOtpError(message: string): string {
  const m = message.toLowerCase()
  if (
    m.includes('expired') ||
    m.includes('invalid') ||
    m.includes('token has expired')
  ) {
    return 'El código expiró o no es válido. Usá «Reenviar código» y probá con el último SMS recibido (el anterior queda anulado).'
  }
  return message
}

type BodySend = { action: 'send'; phone: string }
type BodyVerify = { action: 'verify'; phone: string; token: string }
type OtpBody = BodySend | BodyVerify

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function parseBody(json: unknown): OtpBody | null {
  if (!isRecord(json)) return null
  const action = json.action
  const phone = json.phone
  const token = json.token
  if (action === 'send' && typeof phone === 'string') {
    return { action: 'send', phone }
  }
  if (
    action === 'verify' &&
    typeof phone === 'string' &&
    typeof token === 'string'
  ) {
    return { action: 'verify', phone, token }
  }
  return null
}

function assertEnv(): { url: string; anonKey: string } | NextResponse {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return NextResponse.json(
      {
        error:
          'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.',
      },
      { status: 503 }
    )
  }
  return { url, anonKey }
}

function redirectPathForRole(role: UserRole): string {
  if (role === 'warehouse' || role === 'admin') return '/almacen/dashboard'
  return '/catalogo'
}

export async function POST(request: Request) {
  const env = assertEnv()
  if (env instanceof NextResponse) return env

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const body = parseBody(json)
  if (!body) {
    return NextResponse.json(
      {
        error:
          'Cuerpo inválido. Usa { action: "send", phone } o { action: "verify", phone, token }.',
      },
      { status: 400 }
    )
  }

  let phoneE164: string
  try {
    phoneE164 = normalizePhoneCo(body.phone)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Teléfono inválido.'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const cookieStore = await cookies()

  // Buffer de cookies que Supabase quiere setear — captura nombre, valor Y opciones.
  // Esto corrige el bug donde appendSessionCookies perdía httpOnly/maxAge/sameSite.
  type CookieEntry = { name: string; value: string; options: Record<string, unknown> }
  const pendingCookies: CookieEntry[] = []

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        pendingCookies.push(...cookiesToSet)
      },
    },
  })

  if (body.action === 'send') {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneE164,
      options: { shouldCreateUser: true },
    })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    const response = NextResponse.json({ ok: true })
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options)
    }
    return response
  }

  // action === 'verify'
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        error:
          'Falta SUPABASE_SERVICE_ROLE_KEY para sincronizar el perfil tras el OTP.',
      },
      { status: 503 }
    )
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneE164,
    token: body.token.replace(/\s/g, ''),
    type: 'sms',
  })

  if (error) {
    return NextResponse.json(
      { error: friendlyOtpError(error.message) },
      { status: 400 }
    )
  }

  const user = data.user
  if (!user) {
    return NextResponse.json(
      { error: 'No se obtuvo usuario tras verificar el código.' },
      { status: 500 }
    )
  }

  try {
    const { role } = await syncUserAfterAuth({
      userId: user.id,
      phoneE164,
    })

    // Construir la respuesta final con el redirect y aplicar TODAS las cookies
    // con sus opciones originales (httpOnly, maxAge, sameSite, path, secure).
    const final = NextResponse.json({
      ok: true,
      redirect: redirectPathForRole(role),
    })
    for (const { name, value, options } of pendingCookies) {
      final.cookies.set(name, value, options)
    }
    return final
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Error al sincronizar usuario.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
