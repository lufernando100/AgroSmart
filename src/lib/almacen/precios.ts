import { createClient } from '@/lib/supabase/server'

function productoDesdeJoin(
  raw: unknown
): { nombre: string; presentacion: string | null; unidad_medida: string } | null {
  const p = Array.isArray(raw) ? raw[0] : raw
  if (typeof p !== 'object' || p === null) return null
  const o = p as Record<string, unknown>
  const nombre = o.nombre
  const unidad_medida = o.unidad_medida
  if (typeof nombre !== 'string' || typeof unidad_medida !== 'string') return null
  const presentacion = o.presentacion
  return {
    nombre,
    presentacion: typeof presentacion === 'string' ? presentacion : null,
    unidad_medida,
  }
}

export type PrecioAlmacenFila = {
  precio_id: string
  producto_id: string
  nombre: string
  presentacion: string | null
  unidad_medida: string
  precio_unitario: number
  disponible: boolean
}

export async function listarPreciosAlmacen(
  usuarioAlmacenId: string
): Promise<PrecioAlmacenFila[]> {
  const supabase = await createClient()
  const { data: alm } = await supabase
    .from('almacenes')
    .select('id')
    .eq('usuario_id', usuarioAlmacenId)
    .maybeSingle()

  if (!alm?.id) return []

  const { data, error } = await supabase
    .from('precios')
    .select(
      'id, precio_unitario, disponible, producto_id, productos ( nombre, presentacion, unidad_medida )'
    )
    .eq('almacen_id', alm.id)
    .order('producto_id')

  if (error) throw new Error(error.message)

  const rows: PrecioAlmacenFila[] = []
  for (const r of data ?? []) {
    if (typeof r !== 'object' || r === null) continue
    const row = r as Record<string, unknown>
    const id = row.id
    const producto_id = row.producto_id
    const pu = row.precio_unitario
    if (typeof id !== 'string' || typeof producto_id !== 'string') continue
    const prod = productoDesdeJoin(row.productos)
    if (!prod) continue
    const precioNum = typeof pu === 'number' ? pu : Number(pu)
    if (!Number.isFinite(precioNum)) continue
    rows.push({
      precio_id: id,
      producto_id,
      nombre: prod.nombre,
      presentacion: prod.presentacion,
      unidad_medida: prod.unidad_medida,
      precio_unitario: precioNum,
      disponible: row.disponible !== false,
    })
  }

  rows.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  return rows
}

export async function actualizarPrecioAlmacen(params: {
  usuarioAlmacenId: string
  precioId: string
  precio_unitario?: number
  disponible?: boolean
}): Promise<void> {
  const supabase = await createClient()
  const { data: alm } = await supabase
    .from('almacenes')
    .select('id')
    .eq('usuario_id', params.usuarioAlmacenId)
    .maybeSingle()

  if (!alm?.id) throw new Error('No se encontró almacén asociado a tu cuenta.')

  const { data: pr, error: e0 } = await supabase
    .from('precios')
    .select('id, almacen_id')
    .eq('id', params.precioId)
    .maybeSingle()

  if (e0) throw new Error(e0.message)
  if (!pr || pr.almacen_id !== alm.id) {
    throw new Error('Precio no encontrado o sin permiso.')
  }

  const update: Record<string, string | number | boolean> = {
    actualizado_at: new Date().toISOString(),
  }
  if (params.precio_unitario !== undefined) {
    if (params.precio_unitario < 0) throw new Error('Precio inválido.')
    update.precio_unitario = params.precio_unitario
  }
  if (params.disponible !== undefined) {
    update.disponible = params.disponible
  }

  const { error } = await supabase
    .from('precios')
    .update(update)
    .eq('id', params.precioId)

  if (error) throw new Error(error.message)
}
