/**
 * Mapea errores de Postgres/Supabase a mensajes amigables en español colombiano.
 *
 * REGLA: Nunca mostrar al usuario códigos SQL, nombres de tablas, ni stack traces.
 * Usar esta función en TODO catch de operaciones de BD antes de responder al cliente.
 */
export function friendlyDbError(err: {
  code?: string
  message?: string
}): string {
  const code = err.code ?? ''
  const msg = (err.message ?? '').toLowerCase()

  // FK violation — 23503
  if (code === '23503' || (code === '' && msg.includes('foreign key'))) {
    if (msg.includes('caficultor_id')) {
      return 'Tu perfil no está listo. Cierra sesión, vuelve a entrar e intenta de nuevo.'
    }
    if (msg.includes('almacen_id')) {
      return 'El almacén seleccionado ya no está disponible.'
    }
    if (msg.includes('producto_id')) {
      return 'Uno de los productos ya no está en el catálogo.'
    }
    return 'Referencia inválida. Recarga la página e intenta de nuevo.'
  }

  // Duplicado — 23505
  if (code === '23505' || (code === '' && msg.includes('unique'))) {
    return 'Este registro ya existe. Recarga la página y verifica.'
  }

  // Campo nulo requerido — 23502
  if (code === '23502' || (code === '' && msg.includes('not null'))) {
    return 'Falta un campo obligatorio. Completa el formulario e intenta de nuevo.'
  }

  // Permiso denegado (RLS) — 42501
  if (
    code === '42501' ||
    code === 'PGRST301' ||
    msg.includes('permission denied') ||
    msg.includes('rls') ||
    msg.includes('row-level security')
  ) {
    return 'No tienes permiso para esta acción. Recarga e intenta de nuevo.'
  }

  // Timeout / conexión
  if (msg.includes('timeout') || msg.includes('connection')) {
    return 'El servidor tardó demasiado. Revisa tu conexión e intenta de nuevo.'
  }

  // Genérico
  return 'Ocurrió un error inesperado. Reintenta en un momento.'
}

/**
 * Detecta si el error es un FK violation sobre una columna específica.
 * Útil para dar mensajes contextuales en el service layer.
 */
export function isFkViolation(
  err: { code?: string; message?: string },
  columna?: string
): boolean {
  const code = err.code ?? ''
  const msg = (err.message ?? '').toLowerCase()
  const esFk =
    code === '23503' || (code === '' && msg.includes('foreign key'))
  if (!columna) return esFk
  return esFk && msg.includes(columna.toLowerCase())
}
