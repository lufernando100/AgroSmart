import { createAdminClient } from '@/lib/supabase/admin'
import { phoneForDb } from '@/lib/auth/phone'
import type { UsuarioRol } from '@/types/database'

const ROLES: readonly UsuarioRol[] = [
  'caficultor',
  'almacen',
  'admin',
  'cooperativa',
]

function parseRol(value: string | undefined): UsuarioRol | null {
  if (!value) return null
  return ROLES.includes(value as UsuarioRol) ? (value as UsuarioRol) : null
}

/**
 * Tras verificar OTP: asegura fila en `usuarios` con id = auth user id
 * (requerido para RLS con auth.uid()) y copia `rol` a user_metadata JWT.
 */
export async function syncUsuarioAfterAuth(params: {
  userId: string
  phoneE164: string
}): Promise<{ rol: UsuarioRol }> {
  const admin = createAdminClient()
  const telefono = phoneForDb(params.phoneE164)

  const { data: existing, error: selectError } = await admin
    .from('usuarios')
    .select('id, rol')
    .eq('id', params.userId)
    .maybeSingle()

  if (selectError) {
    throw new Error(selectError.message)
  }

  if (existing) {
    const rol = parseRol(existing.rol as string) ?? 'caficultor'
    const { error: metaError } = await admin.auth.admin.updateUserById(
      params.userId,
      { user_metadata: { rol } }
    )
    if (metaError) throw new Error(metaError.message)
    return { rol }
  }

  const row = {
    id: params.userId,
    telefono,
    nombre: 'Caficultor',
    rol: 'caficultor' as const,
    sector: 'cafe' as const,
    activo: true,
    metadata: {},
  }

  let inserted = await admin.from('usuarios').insert(row).select('rol').single()

  const isTelefonoDuplicado = (err: { code?: string; message?: string }) =>
    err.code === '23505' ||
    (typeof err.message === 'string' &&
      (err.message.includes('usuarios_telefono_key') ||
        err.message.includes('duplicate key')))

  if (inserted.error && isTelefonoDuplicado(inserted.error)) {
    const { data: otro } = await admin
      .from('usuarios')
      .select('id')
      .eq('telefono', telefono)
      .maybeSingle()

    if (otro && otro.id !== params.userId) {
      const { data: authOtro } = await admin.auth.admin.getUserById(otro.id as string)
      if (!authOtro?.user) {
        const { error: delErr } = await admin
          .from('usuarios')
          .delete()
          .eq('id', otro.id as string)
        if (delErr) throw new Error(delErr.message)
        inserted = await admin.from('usuarios').insert(row).select('rol').single()
      }
    }
  }

  if (inserted.error) {
    throw new Error(
      isTelefonoDuplicado(inserted.error)
        ? 'Este teléfono ya está asociado a otro usuario. Si borraste la cuenta en Auth, pide a soporte limpiar la fila en public.usuarios o usa otro número.'
        : inserted.error.message
    )
  }

  const rol = parseRol(inserted.data?.rol as string) ?? 'caficultor'

  const { error: metaError } = await admin.auth.admin.updateUserById(
    params.userId,
    { user_metadata: { rol } }
  )
  if (metaError) throw new Error(metaError.message)

  return { rol }
}
