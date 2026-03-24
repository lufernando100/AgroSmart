import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizePhoneCo, phoneForDb } from '@/lib/auth/phone'
import { friendlyDbError } from '@/lib/utils/db-errors'
import type { UserRole } from '@/types/database'

const ROLES: readonly UserRole[] = [
  'farmer',
  'warehouse',
  'admin',
  'cooperative',
]

function parseRole(value: string | undefined): UserRole | null {
  if (!value) return null
  return ROLES.includes(value as UserRole) ? (value as UserRole) : null
}

/**
 * After OTP verify: ensure a row in `users` with id = auth user id
 * (required for RLS with auth.uid()) and copy `role` into JWT user_metadata.
 */
export async function syncUserAfterAuth(params: {
  userId: string
  phoneE164: string
}): Promise<{ role: UserRole }> {
  const admin = createAdminClient()
  const phone = phoneForDb(params.phoneE164)

  const { data: existing, error: selectError } = await admin
    .from('users')
    .select('id, role')
    .eq('id', params.userId)
    .maybeSingle()

  if (selectError) {
    throw new Error(selectError.message)
  }

  if (existing) {
    const role = parseRole(existing.role as string) ?? 'farmer'
    const { error: metaError } = await admin.auth.admin.updateUserById(
      params.userId,
      { user_metadata: { role } }
    )
    if (metaError) throw new Error(metaError.message)
    return { role }
  }

  const row = {
    id: params.userId,
    phone,
    name: 'Caficultor',
    role: 'farmer' as const,
    sector: 'coffee' as const,
    active: true,
    metadata: {},
  }

  let inserted = await admin.from('users').insert(row).select('role').single()

  const isDuplicatePhone = (err: { code?: string; message?: string }) =>
    err.code === '23505' ||
    (typeof err.message === 'string' &&
      (err.message.includes('users_phone_key') ||
        err.message.includes('duplicate key')))

  if (inserted.error && isDuplicatePhone(inserted.error)) {
    const { data: other } = await admin
      .from('users')
      .select('id')
      .eq('phone', phone)
      .maybeSingle()

    if (other && other.id !== params.userId) {
      const { data: authOther } = await admin.auth.admin.getUserById(other.id as string)
      if (!authOther?.user) {
        const { error: delErr } = await admin
          .from('users')
          .delete()
          .eq('id', other.id as string)
        if (delErr) throw new Error(delErr.message)
        inserted = await admin.from('users').insert(row).select('role').single()
      }
    }
  }

  if (inserted.error) {
    throw new Error(
      isDuplicatePhone(inserted.error)
        ? 'Este teléfono ya está asociado a otro usuario. Si borraste la cuenta en Auth, pide a soporte limpiar la fila en public.users o usa otro número.'
        : inserted.error.message
    )
  }

  const role = parseRole(inserted.data?.role as string) ?? 'farmer'

  const { error: metaError } = await admin.auth.admin.updateUserById(
    params.userId,
    { user_metadata: { role } }
  )
  if (metaError) throw new Error(metaError.message)

  return { role }
}

function coerceAuthPhoneToE164(raw: string): string {
  const t = raw.trim()
  if (!t) {
    throw new Error('missing_phone')
  }
  try {
    return normalizePhoneCo(t)
  } catch {
    const digits = t.replace(/\D/g, '')
    if (digits.length === 12 && digits.startsWith('57')) {
      return `+${digits}`
    }
    if (t.startsWith('+')) return t
    throw new Error('missing_phone')
  }
}

/**
 * If `public.users` has no row for this auth user, try to run the same sync as OTP
 * (needs `user.phone` on the session). Fixes desync after interrupted signup or stale cookies.
 */
export async function ensureFarmerUserRowBeforeOrder(
  supabase: SupabaseClient,
  farmerId: string
): Promise<void> {
  const { data: row } = await supabase
    .from('users')
    .select('id')
    .eq('id', farmerId)
    .maybeSingle()

  if (row) return

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.id !== farmerId) {
    throw new Error(
      'Tu perfil no está listo. Cierra sesión, vuelve a entrar e intenta de nuevo.'
    )
  }

  const phoneRaw = user.phone
  if (typeof phoneRaw !== 'string' || !phoneRaw.trim()) {
    throw new Error(
      'Tu perfil no está listo. Iniciá sesión otra vez con tu celular e intentá de nuevo.'
    )
  }

  let e164: string
  try {
    e164 = coerceAuthPhoneToE164(phoneRaw)
  } catch {
    throw new Error(
      'Tu perfil no está listo. Cierra sesión, volvé a entrar con tu número e intentá de nuevo.'
    )
  }

  await syncUserAfterAuth({ userId: farmerId, phoneE164: e164 })

  // Re-check with service role: anon/session client may not see the row if RLS on `users`
  // blocks SELECT even for own id (common when the row was just created via admin).
  const admin = createAdminClient()
  const { data: again, error: verifyError } = await admin
    .from('users')
    .select('id')
    .eq('id', farmerId)
    .maybeSingle()

  if (verifyError) {
    throw new Error(friendlyDbError(verifyError))
  }
  if (!again) {
    throw new Error(
      'No pudimos preparar tu perfil. Si sigue fallando, contactá soporte.'
    )
  }
}

/** Same as ensureFarmerUserRowBeforeOrder for WhatsApp/admin paths (no browser cookies). */
export async function ensureFarmerUserRowBeforeAdminOrder(
  farmerId: string
): Promise<void> {
  const admin = createAdminClient()
  const { data: row } = await admin
    .from('users')
    .select('id')
    .eq('id', farmerId)
    .maybeSingle()

  if (row) return

  const { data: bundle, error } = await admin.auth.admin.getUserById(farmerId)
  if (error || !bundle?.user) {
    throw new Error(
      'Tu perfil no está listo. Cierra sesión, vuelve a entrar e intenta de nuevo.'
    )
  }

  const phoneRaw = bundle.user.phone
  if (typeof phoneRaw !== 'string' || !phoneRaw.trim()) {
    throw new Error(
      'Tu perfil no está listo. El caficultor debe iniciar sesión al menos una vez con su celular.'
    )
  }

  let e164: string
  try {
    e164 = coerceAuthPhoneToE164(phoneRaw)
  } catch {
    throw new Error(
      'Tu perfil no está listo. Cierra sesión, volvé a entrar con tu número e intentá de nuevo.'
    )
  }

  await syncUserAfterAuth({ userId: farmerId, phoneE164: e164 })

  const { data: again } = await admin
    .from('users')
    .select('id')
    .eq('id', farmerId)
    .maybeSingle()

  if (!again) {
    throw new Error(
      'No pudimos preparar tu perfil. Si sigue fallando, contactá soporte.'
    )
  }
}
