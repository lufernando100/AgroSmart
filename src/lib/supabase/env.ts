/**
 * Variables públicas de Supabase (NEXT_PUBLIC_*).
 * Validación temprana evita errores crípticos del cliente tipo "Project not specified."
 */

export function getPublicSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''

  if (!url || !anonKey) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. Crea .env.local desde .env.local.example y pega la URL y la anon key del proyecto (Supabase → Settings → API). Reinicia npm run dev.'
    )
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL no es una URL válida. Debe ser https://<ref>.supabase.co'
    )
  }

  const local =
    parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  if (!local && parsed.protocol !== 'https:') {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL debe usar https:// (Project URL en Supabase → Settings → API).'
    )
  }
  if (local && parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('URL de Supabase local inválida.')
  }

  return { url, anonKey }
}
