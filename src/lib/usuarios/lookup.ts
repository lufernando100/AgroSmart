import { createAdminClient } from '@/lib/supabase/admin'

/** Busca usuario por teléfono almacenado (dígitos, con o sin 57). */
export async function buscarUsuarioPorTelefono(
  telefonoDigits: string
): Promise<{ id: string; nombre: string; telefono: string } | null> {
  const admin = createAdminClient()
  const d = telefonoDigits.replace(/\D/g, '')
  const variants = [d]
  if (d.length === 10 && d.startsWith('3')) {
    variants.push(`57${d}`)
  }
  if (d.length === 12 && d.startsWith('57')) {
    variants.push(d.slice(2))
  }

  const { data, error } = await admin
    .from('usuarios')
    .select('id, nombre, telefono')
    .in('telefono', variants)
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return {
    id: data.id as string,
    nombre: data.nombre as string,
    telefono: data.telefono as string,
  }
}
