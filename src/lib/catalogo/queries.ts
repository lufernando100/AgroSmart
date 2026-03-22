import { createClient } from '@/lib/supabase/server'
import type { SectorTipo } from '@/types/database'

export type ProductoListado = {
  id: string
  nombre: string
  nombre_corto: string | null
  presentacion: string | null
  unidad_medida: string
  categoria_id: string | null
  categoria_nombre: string | null
  precio_desde: number
  almacenes_count: number
  /** URL de la foto del producto (almacenada en metadata.foto_url). Null si no tiene foto. */
  foto_url: string | null
  distancia_km_min?: number
}

type ProductoRow = {
  id: string
  nombre: string
  nombre_corto: string | null
  presentacion: string | null
  unidad_medida: string
  categoria_id: string | null
  sector: string
  metadata: Record<string, unknown> | null
  categorias: { nombre: string } | null
}

/** Extrae foto_url del campo JSONB metadata del producto. */
function extractFotoUrl(metadata: Record<string, unknown> | null): string | null {
  if (!metadata || typeof metadata !== 'object') return null
  const url = metadata.foto_url
  return typeof url === 'string' && url.trim().length > 0 ? url.trim() : null
}

type PrecioRow = {
  producto_id: string
  almacen_id: string
  precio_unitario: number | string
}

function aggregatePrecios(rows: PrecioRow[]) {
  const map = new Map<string, { min: number; almacenes: Set<string> }>()
  for (const r of rows) {
    const price = Number(r.precio_unitario)
    const cur = map.get(r.producto_id) ?? {
      min: Number.POSITIVE_INFINITY,
      almacenes: new Set<string>(),
    }
    cur.min = Math.min(cur.min, price)
    cur.almacenes.add(r.almacen_id)
    map.set(r.producto_id, cur)
  }
  return map
}

function isSectorTipo(s: string): s is SectorTipo {
  return s === 'cafe' || s === 'ganaderia' || s === 'cacao' || s === 'otro'
}

export async function listarCategoriasActivas(): Promise<
  { id: string; nombre: string; orden: number }[]
> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categorias')
    .select('id, nombre, orden')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id as string,
    nombre: r.nombre as string,
    orden: Number(r.orden),
  }))
}

export async function listarProductosResumen(params: {
  sector?: SectorTipo
  categoriaId?: string | null
}): Promise<ProductoListado[]> {
  const sector = params.sector ?? 'cafe'
  const supabase = await createClient()

  let q = supabase
    .from('productos')
    .select(
      'id, nombre, nombre_corto, presentacion, unidad_medida, categoria_id, sector, metadata, categorias ( nombre )'
    )
    .eq('activo', true)
    .eq('sector', sector)

  if (params.categoriaId) {
    q = q.eq('categoria_id', params.categoriaId)
  }

  const { data: productos, error: e1 } = await q.order('nombre', {
    ascending: true,
  })
  if (e1) throw new Error(e1.message)

  const { data: precios, error: e2 } = await supabase
    .from('precios')
    .select('producto_id, almacen_id, precio_unitario')
    .eq('disponible', true)

  if (e2) throw new Error(e2.message)

  const agg = aggregatePrecios((precios ?? []) as PrecioRow[])
  const rows = (productos ?? []) as unknown as ProductoRow[]

  const list: ProductoListado[] = []
  for (const p of rows) {
    const a = agg.get(p.id)
    if (!a || a.min === Number.POSITIVE_INFINITY) continue
    list.push({
      id: p.id,
      nombre: p.nombre,
      nombre_corto: p.nombre_corto,
      presentacion: p.presentacion,
      unidad_medida: p.unidad_medida,
      categoria_id: p.categoria_id,
      categoria_nombre: p.categorias?.nombre ?? null,
      foto_url: extractFotoUrl(p.metadata),
      precio_desde: a.min,
      almacenes_count: a.almacenes.size,
    })
  }

  return list
}

export async function buscarProductosConDistancia(params: {
  lat: number
  lng: number
  busqueda?: string | null
  categoriaId?: string | null
  sector?: SectorTipo
}): Promise<ProductoListado[]> {
  const supabase = await createClient()
  const sector = params.sector ?? 'cafe'

  const { data, error } = await supabase.rpc('productos_con_distancia', {
    p_lat: params.lat,
    p_lng: params.lng,
    p_busqueda: params.busqueda?.trim() || null,
    p_categoria_id: params.categoriaId ?? null,
    p_sector: sector,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rpcRows = (data ?? []) as {
    producto_id: string
    nombre: string
    nombre_corto: string | null
    presentacion: string | null
    unidad_medida: string
    categoria_id: string | null
    precio_min: number | string
    almacenes_con_precio: number | string
    distancia_km_min: number | string | null
  }[]

  if (rpcRows.length === 0) return []

  const categoriaIds = [
    ...new Set(rpcRows.map((r) => r.categoria_id).filter(Boolean)),
  ] as string[]

  const catMap = new Map<string, string>()
  if (categoriaIds.length > 0) {
    const { data: cats, error: catErr } = await supabase
      .from('categorias')
      .select('id, nombre')
      .in('id', categoriaIds)
    if (catErr) throw new Error(catErr.message)
    for (const c of cats ?? []) {
      catMap.set(c.id as string, c.nombre as string)
    }
  }

  return rpcRows.map((r) => ({
    id: r.producto_id,
    nombre: r.nombre,
    nombre_corto: r.nombre_corto,
    presentacion: r.presentacion,
    unidad_medida: r.unidad_medida,
    categoria_id: r.categoria_id,
    categoria_nombre: r.categoria_id ? catMap.get(r.categoria_id) ?? null : null,
    foto_url: null, // La RPC no retorna metadata; se carga en detalle
    precio_desde: Number(r.precio_min),
    almacenes_count: Number(r.almacenes_con_precio),
    distancia_km_min:
      r.distancia_km_min != null ? Number(r.distancia_km_min) : undefined,
  }))
}

export async function buscarProductosSoloTexto(params: {
  busqueda: string
  categoriaId?: string | null
  sector?: SectorTipo
}): Promise<ProductoListado[]> {
  const sector = params.sector ?? 'cafe'
  const safe = params.busqueda.trim().replace(/[%_]/g, ' ')
  const supabase = await createClient()

  let q = supabase
    .from('productos')
    .select(
      'id, nombre, nombre_corto, presentacion, unidad_medida, categoria_id, sector, metadata, categorias ( nombre )'
    )
    .eq('activo', true)
    .eq('sector', sector)
    .ilike('nombre', `%${safe}%`)

  if (params.categoriaId) {
    q = q.eq('categoria_id', params.categoriaId)
  }

  const { data: productos, error: e1 } = await q.order('nombre', {
    ascending: true,
  })
  if (e1) throw new Error(e1.message)

  const { data: precios, error: e2 } = await supabase
    .from('precios')
    .select('producto_id, almacen_id, precio_unitario')
    .eq('disponible', true)

  if (e2) throw new Error(e2.message)

  const agg = aggregatePrecios((precios ?? []) as PrecioRow[])
  const rows = (productos ?? []) as unknown as ProductoRow[]

  const list: ProductoListado[] = []
  for (const p of rows) {
    const a = agg.get(p.id)
    if (!a || a.min === Number.POSITIVE_INFINITY) continue
    list.push({
      id: p.id,
      nombre: p.nombre,
      nombre_corto: p.nombre_corto,
      presentacion: p.presentacion,
      unidad_medida: p.unidad_medida,
      categoria_id: p.categoria_id,
      categoria_nombre: p.categorias?.nombre ?? null,
      foto_url: extractFotoUrl(p.metadata),
      precio_desde: a.min,
      almacenes_count: a.almacenes.size,
    })
  }

  return list
}

export type MejorPrecioPorProducto = Record<
  string,
  { almacenId: string; almacenNombre: string; precio: number }
>

/**
 * Devuelve el almacén con el precio más bajo para cada producto.
 * Se usa en el catálogo para el botón QuickAdd directo desde la lista.
 */
export async function listarMejoresPreciosPorProducto(): Promise<MejorPrecioPorProducto> {
  const supabase = await createClient()

  type PrecioAlmacenRow = {
    producto_id: string
    precio_unitario: number | string
    almacen_id: string
    almacenes: { nombre: string } | null
  }

  const { data, error } = await supabase
    .from('precios')
    .select('producto_id, precio_unitario, almacen_id, almacenes ( nombre )')
    .eq('disponible', true)

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as unknown as PrecioAlmacenRow[]
  const mejores: MejorPrecioPorProducto = {}

  for (const r of rows) {
    if (!r.almacenes) continue
    const precio = Number(r.precio_unitario)
    const existing = mejores[r.producto_id]
    if (!existing || precio < existing.precio) {
      mejores[r.producto_id] = {
        almacenId: r.almacen_id,
        almacenNombre: r.almacenes.nombre,
        precio,
      }
    }
  }

  return mejores
}

export function parseSector(q: string | null): SectorTipo {
  if (q && isSectorTipo(q)) return q
  return 'cafe'
}

export type PrecioEnAlmacen = {
  precio_id: string
  precio_unitario: number
  almacen_id: string
  almacen_nombre: string
  municipio: string
  departamento: string
  telefono_whatsapp: string | null
}

export type ProductoDetalle = {
  id: string
  nombre: string
  nombre_corto: string | null
  marca: string | null
  presentacion: string | null
  unidad_medida: string
  peso_kg: number | null
  composicion: Record<string, number> | null
  categoria_id: string | null
  categoria_nombre: string | null
  /** URL de foto del producto desde metadata.foto_url. Null si no tiene foto. */
  foto_url: string | null
  precios: PrecioEnAlmacen[]
}

export async function getProductoDetalle(
  productoId: string
): Promise<ProductoDetalle | null> {
  const supabase = await createClient()
  const { data: p, error: e1 } = await supabase
    .from('productos')
    .select(
      'id, nombre, nombre_corto, marca, presentacion, unidad_medida, peso_kg, composicion, metadata, categoria_id, categorias ( nombre )'
    )
    .eq('id', productoId)
    .eq('activo', true)
    .maybeSingle()

  if (e1) throw new Error(e1.message)
  if (!p) return null

  const { data: precRows, error: e2 } = await supabase
    .from('precios')
    .select(
      'id, precio_unitario, almacen_id, almacenes ( id, nombre, municipio, departamento, telefono_whatsapp )'
    )
    .eq('producto_id', productoId)
    .eq('disponible', true)
    .order('precio_unitario', { ascending: true })

  if (e2) throw new Error(e2.message)

  type PRow = {
    id: string
    precio_unitario: number | string
    almacen_id: string
    almacenes: {
      id: string
      nombre: string
      municipio: string
      departamento: string
      telefono_whatsapp: string | null
    } | null
  }

  const precios: PrecioEnAlmacen[] = []
  for (const row of (precRows ?? []) as unknown as PRow[]) {
    if (!row.almacenes) continue
    precios.push({
      precio_id: row.id,
      precio_unitario: Number(row.precio_unitario),
      almacen_id: row.almacenes.id,
      almacen_nombre: row.almacenes.nombre,
      municipio: row.almacenes.municipio,
      departamento: row.almacenes.departamento,
      telefono_whatsapp: row.almacenes.telefono_whatsapp,
    })
  }

  const prow = p as unknown as {
    id: string
    nombre: string
    nombre_corto: string | null
    marca: string | null
    presentacion: string | null
    unidad_medida: string
    peso_kg: number | string | null
    composicion: Record<string, unknown> | null
    metadata: Record<string, unknown> | null
    categoria_id: string | null
    categorias: { nombre: string } | null
  }

  const comp = prow.composicion
  const composicion =
    comp && typeof comp === 'object' && !Array.isArray(comp)
      ? (comp as Record<string, number>)
      : null

  return {
    id: prow.id,
    nombre: prow.nombre,
    nombre_corto: prow.nombre_corto,
    marca: prow.marca,
    presentacion: prow.presentacion,
    unidad_medida: prow.unidad_medida,
    peso_kg: prow.peso_kg != null ? Number(prow.peso_kg) : null,
    composicion,
    categoria_id: prow.categoria_id,
    categoria_nombre: prow.categorias?.nombre ?? null,
    foto_url: extractFotoUrl(prow.metadata),
    precios,
  }
}
