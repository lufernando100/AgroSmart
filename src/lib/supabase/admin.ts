import { Buffer } from 'node:buffer'
import { createClient } from '@supabase/supabase-js'
import { getPublicSupabaseEnv } from '@/lib/supabase/env'

/**
 * Supabase API keys: the admin client must use a key that bypasses RLS (legacy JWT `service_role`,
 * or the server **secret** key from the dashboard — not `anon`, not `sb_publishable_*`).
 */
function assertNotPublishableKey(serviceKey: string): void {
  if (serviceKey.startsWith('sb_publishable_')) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY no puede ser la clave publishable (sb_publishable_…). Esa es pública, como la anon: PostgREST aplica RLS y falla el INSERT en users. En Supabase → Settings → API copiá la clave secreta «service_role» (JWT que empieza con eyJ…) o la clave «Secret» del proyecto si el panel ya no muestra JWT. Pegala en Vercel en SUPABASE_SERVICE_ROLE_KEY y redeploy.'
    )
  }
}

/**
 * Legacy Supabase keys are JWTs. The service_role JWT bypasses RLS; anon/authenticated do not.
 */
function assertServiceRoleJwt(serviceKey: string): void {
  const parts = serviceKey.split('.')
  if (parts.length !== 3) return

  let role: string | undefined
  try {
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = Buffer.from(segment, 'base64').toString('utf8')
    role = (JSON.parse(json) as { role?: string }).role
  } catch {
    return
  }

  if (role && role !== 'service_role') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY no es la clave «service_role». En Supabase → Settings → API copiá la clave «service_role» (secreta), no la «anon». En Vercel debe estar esa misma variable.'
    )
  }
}

// Cliente con service role — SOLO usar en API routes del servidor
export function createAdminClient() {
  const { url } = getPublicSupabaseEnv()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!serviceKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY en .env.local (Supabase → Settings → API → service_role).'
    )
  }

  assertNotPublishableKey(serviceKey)
  assertServiceRoleJwt(serviceKey)

  return createClient(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
