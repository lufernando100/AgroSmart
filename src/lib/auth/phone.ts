/** Normaliza a E.164 para Colombia (+57). Acepta 10 dígitos (3…) o ya con 57. */
export function normalizePhoneCo(input: string): string {
  const digits = input.replace(/\D/g, '')

  if (digits.length === 10 && digits.startsWith('3')) {
    return `+57${digits}`
  }
  if (digits.length === 12 && digits.startsWith('57')) {
    return `+${digits}`
  }
  if (digits.length === 13 && digits.startsWith('573')) {
    return `+${digits}`
  }

  throw new Error(
    'Número inválido. Usa tu celular colombiano de 10 dígitos (ej. 3001234567).'
  )
}

/** Almacenamiento en BD: sin +, máx. 15 caracteres. */
export function phoneForDb(e164: string): string {
  return e164.replace(/^\+/, '')
}
