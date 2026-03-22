import { createAdminClient } from '@/lib/supabase/admin'
import { phoneForDb } from '@/lib/auth/phone'
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
