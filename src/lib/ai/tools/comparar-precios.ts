import { createAdminClient } from '@/lib/supabase/admin'
import { isUuid } from '@/lib/catalogo/uuid'
import type { ToolContext } from './registry'

type WarehouseInfo = {
  name: string
  municipality: string | null
}

type PriceRow = {
  unit_price: number
  warehouse_id: string
  stock: number | null
  warehouses: WarehouseInfo | WarehouseInfo[] | null
}

function getWarehouseInfo(w: WarehouseInfo | WarehouseInfo[] | null): WarehouseInfo | null {
  if (!w) return null
  if (Array.isArray(w)) return w[0] ?? null
  return w
}

export async function compararPrecios(
  input: Record<string, unknown>,
  _contexto: ToolContext
): Promise<unknown> {
  const productoId = String(input.producto_id ?? '')
  if (!isUuid(productoId)) {
    return { error: 'producto_id inválido.' }
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('prices')
    .select(
      'unit_price, warehouse_id, stock, warehouses(name, municipality)'
    )
    .eq('product_id', productoId)
    .eq('is_available', true)
    .order('unit_price', { ascending: true })
    .limit(10)

  if (error) {
    return { error: 'No fue posible consultar los precios.' }
  }

  const rows = (data ?? []) as unknown as PriceRow[]

  if (rows.length === 0) {
    return { almacenes: [], mensaje: 'No hay almacenes con ese producto disponible por el momento.' }
  }

  const almacenes = rows.map((r) => {
    const wh = getWarehouseInfo(r.warehouses)
    return {
      warehouse_id: r.warehouse_id,
      name: wh?.name ?? '',
      municipality: wh?.municipality ?? '',
      unit_price: r.unit_price,
      stock: r.stock,
    }
  })

  return { almacenes }
}
