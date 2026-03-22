import { createClient } from '@/lib/supabase/server'
import type { SectorType } from '@/types/database'

/** Catalog product row for list cards (UI copy is Spanish; field names in English). */
export type ProductSummary = {
  id: string
  name: string
  short_name: string | null
  presentation: string | null
  unit_of_measure: string
  category_id: string | null
  category_name: string | null
  price_from: number
  warehouse_count: number
  photo_url: string | null
  min_distance_km?: number
}

type ProductRow = {
  id: string
  name: string
  short_name: string | null
  presentation: string | null
  unit_of_measure: string
  category_id: string | null
  sector: string
  metadata: Record<string, unknown> | null
  categories: { name: string } | null
}

function extractPhotoUrl(metadata: Record<string, unknown> | null): string | null {
  if (!metadata || typeof metadata !== 'object') return null
  const url = metadata.foto_url
  return typeof url === 'string' && url.trim().length > 0 ? url.trim() : null
}

type PriceRow = {
  product_id: string
  warehouse_id: string
  unit_price: number | string
}

function aggregatePrices(rows: PriceRow[]) {
  const map = new Map<string, { min: number; warehouses: Set<string> }>()
  for (const r of rows) {
    const price = Number(r.unit_price)
    const cur = map.get(r.product_id) ?? {
      min: Number.POSITIVE_INFINITY,
      warehouses: new Set<string>(),
    }
    cur.min = Math.min(cur.min, price)
    cur.warehouses.add(r.warehouse_id)
    map.set(r.product_id, cur)
  }
  return map
}

function isSectorType(s: string): s is SectorType {
  return s === 'coffee' || s === 'livestock' || s === 'cocoa' || s === 'other'
}

export async function listActiveCategories(): Promise<
  { id: string; name: string; sort_order: number }[]
> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, sort_order')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    sort_order: Number(r.sort_order),
  }))
}

export async function listProductSummaries(params: {
  sector?: SectorType
  categoryId?: string | null
}): Promise<ProductSummary[]> {
  const sector = params.sector ?? 'coffee'
  const supabase = await createClient()

  let q = supabase
    .from('products')
    .select(
      'id, name, short_name, presentation, unit_of_measure, category_id, sector, metadata, categories ( name )'
    )
    .eq('active', true)
    .eq('sector', sector)

  if (params.categoryId) {
    q = q.eq('category_id', params.categoryId)
  }

  const { data: products, error: e1 } = await q.order('name', {
    ascending: true,
  })
  if (e1) throw new Error(e1.message)

  const { data: prices, error: e2 } = await supabase
    .from('prices')
    .select('product_id, warehouse_id, unit_price')
    .eq('is_available', true)

  if (e2) throw new Error(e2.message)

  const agg = aggregatePrices((prices ?? []) as PriceRow[])
  const rows = (products ?? []) as unknown as ProductRow[]

  const list: ProductSummary[] = []
  for (const p of rows) {
    const a = agg.get(p.id)
    if (!a || a.min === Number.POSITIVE_INFINITY) continue
    list.push({
      id: p.id,
      name: p.name,
      short_name: p.short_name,
      presentation: p.presentation,
      unit_of_measure: p.unit_of_measure,
      category_id: p.category_id,
      category_name: p.categories?.name ?? null,
      photo_url: extractPhotoUrl(p.metadata),
      price_from: a.min,
      warehouse_count: a.warehouses.size,
    })
  }

  return list
}

export async function searchProductsWithDistance(params: {
  lat: number
  lng: number
  search?: string | null
  categoryId?: string | null
  sector?: SectorType
}): Promise<ProductSummary[]> {
  const supabase = await createClient()
  const sector = params.sector ?? 'coffee'

  const { data, error } = await supabase.rpc('products_with_distance', {
    p_lat: params.lat,
    p_lng: params.lng,
    p_search: params.search?.trim() || null,
    p_category_id: params.categoryId ?? null,
    p_sector: sector,
  })

  if (error) {
    throw new Error(error.message)
  }

  const rpcRows = (data ?? []) as {
    product_id: string
    name: string
    short_name: string | null
    presentation: string | null
    unit_of_measure: string
    category_id: string | null
    min_price: number | string
    warehouses_with_price: number | string
    min_distance_km: number | string | null
  }[]

  if (rpcRows.length === 0) return []

  const categoryIds = [
    ...new Set(rpcRows.map((r) => r.category_id).filter(Boolean)),
  ] as string[]

  const catMap = new Map<string, string>()
  if (categoryIds.length > 0) {
    const { data: cats, error: catErr } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)
    if (catErr) throw new Error(catErr.message)
    for (const c of cats ?? []) {
      catMap.set(c.id as string, c.name as string)
    }
  }

  return rpcRows.map((r) => ({
    id: r.product_id,
    name: r.name,
    short_name: r.short_name,
    presentation: r.presentation,
    unit_of_measure: r.unit_of_measure,
    category_id: r.category_id,
    category_name: r.category_id ? catMap.get(r.category_id) ?? null : null,
    photo_url: null,
    price_from: Number(r.min_price),
    warehouse_count: Number(r.warehouses_with_price),
    min_distance_km:
      r.min_distance_km != null ? Number(r.min_distance_km) : undefined,
  }))
}

export async function searchProductsTextOnly(params: {
  search: string
  categoryId?: string | null
  sector?: SectorType
}): Promise<ProductSummary[]> {
  const sector = params.sector ?? 'coffee'
  const safe = params.search.trim().replace(/[%_]/g, ' ')
  const supabase = await createClient()

  let q = supabase
    .from('products')
    .select(
      'id, name, short_name, presentation, unit_of_measure, category_id, sector, metadata, categories ( name )'
    )
    .eq('active', true)
    .eq('sector', sector)
    .ilike('name', `%${safe}%`)

  if (params.categoryId) {
    q = q.eq('category_id', params.categoryId)
  }

  const { data: products, error: e1 } = await q.order('name', {
    ascending: true,
  })
  if (e1) throw new Error(e1.message)

  const { data: prices, error: e2 } = await supabase
    .from('prices')
    .select('product_id, warehouse_id, unit_price')
    .eq('is_available', true)

  if (e2) throw new Error(e2.message)

  const agg = aggregatePrices((prices ?? []) as PriceRow[])
  const rows = (products ?? []) as unknown as ProductRow[]

  const list: ProductSummary[] = []
  for (const p of rows) {
    const a = agg.get(p.id)
    if (!a || a.min === Number.POSITIVE_INFINITY) continue
    list.push({
      id: p.id,
      name: p.name,
      short_name: p.short_name,
      presentation: p.presentation,
      unit_of_measure: p.unit_of_measure,
      category_id: p.category_id,
      category_name: p.categories?.name ?? null,
      photo_url: extractPhotoUrl(p.metadata),
      price_from: a.min,
      warehouse_count: a.warehouses.size,
    })
  }

  return list
}

export type BestPriceByProduct = Record<
  string,
  { warehouse_id: string; warehouse_name: string; price: number }
>

export async function listBestPricesByProduct(): Promise<BestPriceByProduct> {
  const supabase = await createClient()

  type Row = {
    product_id: string
    unit_price: number | string
    warehouse_id: string
    warehouses: { name: string } | null
  }

  const { data, error } = await supabase
    .from('prices')
    .select('product_id, unit_price, warehouse_id, warehouses ( name )')
    .eq('is_available', true)

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as unknown as Row[]
  const best: BestPriceByProduct = {}

  for (const r of rows) {
    if (!r.warehouses) continue
    const price = Number(r.unit_price)
    const existing = best[r.product_id]
    if (!existing || price < existing.price) {
      best[r.product_id] = {
        warehouse_id: r.warehouse_id,
        warehouse_name: r.warehouses.name,
        price,
      }
    }
  }

  return best
}

export function parseSectorQuery(q: string | null): SectorType {
  if (q && isSectorType(q)) return q
  return 'coffee'
}

export type WarehousePriceRow = {
  price_id: string
  unit_price: number
  warehouse_id: string
  warehouse_name: string
  municipality: string
  department: string
  whatsapp_phone: string | null
}

export type ProductDetail = {
  id: string
  name: string
  short_name: string | null
  brand: string | null
  presentation: string | null
  unit_of_measure: string
  weight_kg: number | null
  composition: Record<string, number> | null
  category_id: string | null
  category_name: string | null
  photo_url: string | null
  prices: WarehousePriceRow[]
}

export async function getProductDetail(
  productId: string
): Promise<ProductDetail | null> {
  const supabase = await createClient()
  const { data: p, error: e1 } = await supabase
    .from('products')
    .select(
      'id, name, short_name, brand, presentation, unit_of_measure, weight_kg, composition, metadata, category_id, categories ( name )'
    )
    .eq('id', productId)
    .eq('active', true)
    .maybeSingle()

  if (e1) throw new Error(e1.message)
  if (!p) return null

  const { data: priceRows, error: e2 } = await supabase
    .from('prices')
    .select(
      'id, unit_price, warehouse_id, warehouses ( id, name, municipality, department, whatsapp_phone )'
    )
    .eq('product_id', productId)
    .eq('is_available', true)
    .order('unit_price', { ascending: true })

  if (e2) throw new Error(e2.message)

  type PRow = {
    id: string
    unit_price: number | string
    warehouse_id: string
    warehouses: {
      id: string
      name: string
      municipality: string
      department: string
      whatsapp_phone: string | null
    } | null
  }

  const prices: WarehousePriceRow[] = []
  for (const row of (priceRows ?? []) as unknown as PRow[]) {
    if (!row.warehouses) continue
    prices.push({
      price_id: row.id,
      unit_price: Number(row.unit_price),
      warehouse_id: row.warehouses.id,
      warehouse_name: row.warehouses.name,
      municipality: row.warehouses.municipality,
      department: row.warehouses.department,
      whatsapp_phone: row.warehouses.whatsapp_phone,
    })
  }

  const prow = p as unknown as {
    id: string
    name: string
    short_name: string | null
    brand: string | null
    presentation: string | null
    unit_of_measure: string
    weight_kg: number | string | null
    composition: Record<string, unknown> | null
    metadata: Record<string, unknown> | null
    category_id: string | null
    categories: { name: string } | null
  }

  const comp = prow.composition
  const composition =
    comp && typeof comp === 'object' && !Array.isArray(comp)
      ? (comp as Record<string, number>)
      : null

  return {
    id: prow.id,
    name: prow.name,
    short_name: prow.short_name,
    brand: prow.brand,
    presentation: prow.presentation,
    unit_of_measure: prow.unit_of_measure,
    weight_kg: prow.weight_kg != null ? Number(prow.weight_kg) : null,
    composition,
    category_id: prow.category_id,
    category_name: prow.categories?.name ?? null,
    photo_url: extractPhotoUrl(prow.metadata),
    prices,
  }
}
