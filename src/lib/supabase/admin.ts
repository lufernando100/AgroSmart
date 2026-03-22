import { createClient } from '@supabase/supabase-js'
import { getPublicSupabaseEnv } from '@/lib/supabase/env'

// Cliente con service role — SOLO usar en API routes del servidor
export function createAdminClient() {
  const { url } = getPublicSupabaseEnv()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!serviceKey) {
    throw new Error(
      'Falta SUPABASE_SERVICE_ROLE_KEY en .env.local (Supabase → Settings → API → service_role).'
    )
  }

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
