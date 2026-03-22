import { createClient } from '@/lib/supabase/server'

function productFromJoin(
  raw: unknown
): { name: string; presentation: string | null; unit_of_measure: string } | null {
  const p = Array.isArray(raw) ? raw[0] : raw
  if (typeof p !== 'object' || p === null) return null
  const o = p as Record<string, unknown>
  const name = o.name
  const unit_of_measure = o.unit_of_measure
  if (typeof name !== 'string' || typeof unit_of_measure !== 'string') return null
  const presentation = o.presentation
  return {
    name,
    presentation: typeof presentation === 'string' ? presentation : null,
    unit_of_measure,
  }
}

export type WarehousePriceRow = {
  price_id: string
  product_id: string
  name: string
  presentation: string | null
  unit_of_measure: string
  unit_price: number
  is_available: boolean
}

export async function listWarehousePrices(
  warehouseUserId: string
): Promise<WarehousePriceRow[]> {
  const supabase = await createClient()
  const { data: wh } = await supabase
    .from('warehouses')
    .select('id')
    .eq('user_id', warehouseUserId)
    .maybeSingle()

  if (!wh?.id) return []

  const { data, error } = await supabase
    .from('prices')
    .select(
      'id, unit_price, is_available, product_id, products ( name, presentation, unit_of_measure )'
    )
    .eq('warehouse_id', wh.id)
    .order('product_id')

  if (error) throw new Error(error.message)

  const rows: WarehousePriceRow[] = []
  for (const r of data ?? []) {
    if (typeof r !== 'object' || r === null) continue
    const row = r as Record<string, unknown>
    const id = row.id
    const product_id = row.product_id
    const pu = row.unit_price
    if (typeof id !== 'string' || typeof product_id !== 'string') continue
    const prod = productFromJoin(row.products)
    if (!prod) continue
    const priceNum = typeof pu === 'number' ? pu : Number(pu)
    if (!Number.isFinite(priceNum)) continue
    rows.push({
      price_id: id,
      product_id,
      name: prod.name,
      presentation: prod.presentation,
      unit_of_measure: prod.unit_of_measure,
      unit_price: priceNum,
      is_available: row.is_available !== false,
    })
  }

  rows.sort((a, b) => a.name.localeCompare(b.name, 'es'))
  return rows
}

export async function updateWarehousePrice(params: {
  warehouseUserId: string
  priceId: string
  unit_price?: number
  is_available?: boolean
}): Promise<void> {
  const supabase = await createClient()
  const { data: wh } = await supabase
    .from('warehouses')
    .select('id')
    .eq('user_id', params.warehouseUserId)
    .maybeSingle()

  if (!wh?.id) throw new Error('No se encontró almacén asociado a tu cuenta.')

  const { data: pr, error: e0 } = await supabase
    .from('prices')
    .select('id, warehouse_id')
    .eq('id', params.priceId)
    .maybeSingle()

  if (e0) throw new Error(e0.message)
  if (!pr || pr.warehouse_id !== wh.id) {
    throw new Error('Precio no encontrado o sin permiso.')
  }

  const update: Record<string, string | number | boolean> = {
    updated_at: new Date().toISOString(),
  }
  if (params.unit_price !== undefined) {
    if (params.unit_price < 0) throw new Error('Precio inválido.')
    update.unit_price = params.unit_price
  }
  if (params.is_available !== undefined) {
    update.is_available = params.is_available
  }

  const { error } = await supabase
    .from('prices')
    .update(update)
    .eq('id', params.priceId)

  if (error) throw new Error(error.message)
}
