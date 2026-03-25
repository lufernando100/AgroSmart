import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  ensureFarmerUserRowBeforeAdminOrder,
  ensureFarmerUserRowBeforeOrder,
} from '@/lib/auth/sync-user'
import { friendlyDbError } from '@/lib/utils/db-errors'
import { isMissingOrdersMetadataColumn } from '@/lib/pedidos/orders-metadata-migration'
import type { Channel, OrderStatus } from '@/types/database'

export type OrderLineInput = {
  product_id: string
  quantity: number
}

/** One line for batch create: product belongs to a specific warehouse price row. */
export type OrderLineWithWarehouse = {
  warehouse_id: string
  product_id: string
  quantity: number
}

function tempOrderNumber(): string {
  return `T-${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`
}

/** Includes `metadata` (JSONB) — requires `database/11_orders_metadata.sql` on Supabase. */
const ORDER_SELECT_FOR_USER_WITH_META =
  'id, order_number, status, channel, subtotal, commission, total, warehouse_confirmed_price, notes, warehouse_notes, confirmed_at, delivered_at, created_at, farmer_id, warehouse_id, metadata, warehouses ( name, whatsapp_phone, municipality )'

const ORDER_SELECT_FOR_USER_NO_META =
  'id, order_number, status, channel, subtotal, commission, total, warehouse_confirmed_price, notes, warehouse_notes, confirmed_at, delivered_at, created_at, farmer_id, warehouse_id, warehouses ( name, whatsapp_phone, municipality )'

export async function createOrder(params: {
  farmerId: string
  warehouseId: string
  channel: Channel
  notes?: string
  items: OrderLineInput[]
}): Promise<{ orderId: string; orderNumber: string; total: number; subtotal: number }> {
  if (params.items.length === 0) {
    throw new Error('El pedido debe tener al menos un producto.')
  }

  const supabase = await createClient()

  const { data: warehouse, error: eWh } = await supabase
    .from('warehouses')
    .select('id, commission_percentage, active, accepts_digital_orders')
    .eq('id', params.warehouseId)
    .maybeSingle()

  if (eWh) throw new Error(eWh.message)
  if (!warehouse?.active) throw new Error('El almacén no está disponible.')
  if (warehouse.accepts_digital_orders === false) {
    throw new Error('Este almacén no acepta pedidos digitales.')
  }

  let subtotal = 0
  const lines: {
    product_id: string
    quantity: number
    unit_price: number
    subtotal: number
  }[] = []

  for (const it of params.items) {
    if (it.quantity < 1) throw new Error('Cantidad inválida.')
    const { data: price, error: eP } = await supabase
      .from('prices')
      .select('unit_price, is_available')
      .eq('product_id', it.product_id)
      .eq('warehouse_id', params.warehouseId)
      .maybeSingle()

    if (eP) throw new Error(eP.message)
    if (!price?.is_available) {
      throw new Error('Un producto no está disponible en este almacén.')
    }

    const pu = Number(price.unit_price)
    const st = pu * it.quantity
    subtotal += st
    lines.push({
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price: pu,
      subtotal: st,
    })
  }

  await ensureFarmerUserRowBeforeOrder(supabase, params.farmerId)

  const total = subtotal
  const commission = 0

  const { data: order, error: eOrd } = await supabase
    .from('orders')
    .insert({
      order_number: tempOrderNumber(),
      farmer_id: params.farmerId,
      warehouse_id: params.warehouseId,
      channel: params.channel,
      subtotal,
      commission,
      total,
      notes: params.notes ?? null,
      status: 'pending' as OrderStatus,
    })
    .select('id, order_number')
    .single()

  if (eOrd) throw new Error(friendlyDbError(eOrd))
  if (!order) throw new Error('No se pudo crear el pedido.')

  const orderId = order.id as string
  const orderNumber = order.order_number as string

  const inserts = lines.map((l) => ({
    order_id: orderId,
    product_id: l.product_id,
    quantity: l.quantity,
    unit_price: l.unit_price,
    subtotal: l.subtotal,
  }))

  const { error: eItems } = await supabase.from('order_items').insert(inserts)
  if (eItems) {
    await supabase.from('orders').delete().eq('id', orderId)
    throw new Error(friendlyDbError(eItems))
  }

  return { orderId, orderNumber, total, subtotal }
}

/**
 * Creates one order per distinct warehouse_id. Lines are merged by (warehouse, product).
 */
export async function createOrdersForFarmer(params: {
  farmerId: string
  channel: Channel
  notes?: string
  lines: OrderLineWithWarehouse[]
}): Promise<{
  orders: Array<{
    orderId: string
    orderNumber: string
    warehouseId: string
    subtotal: number
    total: number
  }>
  total: number
}> {
  if (params.lines.length === 0) {
    throw new Error('El pedido debe tener al menos un producto.')
  }

  const byWarehouse = new Map<string, Map<string, number>>()

  for (const line of params.lines) {
    if (!byWarehouse.has(line.warehouse_id)) {
      byWarehouse.set(line.warehouse_id, new Map())
    }
    const m = byWarehouse.get(line.warehouse_id)!
    const prev = m.get(line.product_id) ?? 0
    m.set(line.product_id, prev + line.quantity)
  }

  const orders: Array<{
    orderId: string
    orderNumber: string
    warehouseId: string
    subtotal: number
    total: number
  }> = []
  let grandTotal = 0

  for (const [warehouseId, productMap] of byWarehouse) {
    const items: OrderLineInput[] = []
    for (const [product_id, quantity] of productMap) {
      items.push({ product_id, quantity })
    }
    const created = await createOrder({
      farmerId: params.farmerId,
      warehouseId,
      channel: params.channel,
      notes: params.notes,
      items,
    })
    grandTotal += created.total
    orders.push({
      orderId: created.orderId,
      orderNumber: created.orderNumber,
      warehouseId,
      subtotal: created.subtotal,
      total: created.total,
    })
  }

  return { orders, total: grandTotal }
}

export async function getOrderForUser(
  orderId: string,
  userId: string,
  role: string | undefined
) {
  const supabase = await createClient()
  let { data: order, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT_FOR_USER_WITH_META)
    .eq('id', orderId)
    .maybeSingle()

  if (error && isMissingOrdersMetadataColumn(error)) {
    ;({ data: order, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT_FOR_USER_NO_META)
      .eq('id', orderId)
      .maybeSingle())
  }

  if (error) throw new Error(error.message)
  if (!order) return null

  if (role === 'warehouse' || role === 'admin') {
    const { data: wh } = await supabase
      .from('warehouses')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    if (role !== 'admin' && order.warehouse_id !== wh?.id) return null
  } else if (order.farmer_id !== userId) {
    return null
  }

  const { data: items } = await supabase
    .from('order_items')
    .select(
      'id, quantity, unit_price, subtotal, products ( id, name, short_name, presentation, unit_of_measure )'
    )
    .eq('order_id', orderId)

  return { order, items: items ?? [] }
}

export async function updateOrderByWarehouse(params: {
  orderId: string
  warehouseUserId: string
  action: 'confirm' | 'reject' | 'deliver'
  confirmedPrice?: number
  warehouseNotes?: string
}) {
  const supabase = await createClient()

  const { data: wh } = await supabase
    .from('warehouses')
    .select('id, commission_percentage')
    .eq('user_id', params.warehouseUserId)
    .maybeSingle()

  if (!wh) throw new Error('No se encontró almacén asociado a tu cuenta.')

  const { data: order, error: e0 } = await supabase
    .from('orders')
    .select('id, status, warehouse_id, subtotal')
    .eq('id', params.orderId)
    .maybeSingle()

  if (e0) throw new Error(e0.message)
  if (!order || order.warehouse_id !== wh.id) {
    throw new Error('Pedido no encontrado o sin permiso.')
  }

  const status = order.status as OrderStatus
  const subtotal = Number(order.subtotal)

  if (params.action === 'confirm') {
    if (status !== 'pending') throw new Error('Solo se pueden confirmar pedidos pendientes.')
    const pct = Number(wh.commission_percentage ?? 0)
    const priceConf =
      params.confirmedPrice != null ? params.confirmedPrice : subtotal
    const commission = Math.round((subtotal * pct) / 100 * 100) / 100
    const { error: e1 } = await supabase
      .from('orders')
      .update({
        status: 'confirmed' as OrderStatus,
        warehouse_confirmed_price: priceConf,
        commission,
        total: subtotal,
        confirmed_at: new Date().toISOString(),
        warehouse_notes: params.warehouseNotes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.orderId)
    if (e1) throw new Error(e1.message)
    return { status: 'confirmed' as const }
  }

  if (params.action === 'reject') {
    if (status !== 'pending') throw new Error('Solo se pueden rechazar pedidos pendientes.')
    const { error: e2 } = await supabase
      .from('orders')
      .update({
        status: 'rejected' as OrderStatus,
        warehouse_notes: params.warehouseNotes ?? 'Rechazado',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.orderId)
    if (e2) throw new Error(e2.message)
    return { status: 'rejected' as const }
  }

  if (params.action === 'deliver') {
    if (status !== 'confirmed') {
      throw new Error('Solo se pueden entregar pedidos confirmados.')
    }
    const { error: e3 } = await supabase
      .from('orders')
      .update({
        status: 'delivered' as OrderStatus,
        delivered_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.orderId)
    if (e3) throw new Error(e3.message)
    return { status: 'delivered' as const }
  }

  throw new Error('Invalid action.')
}

export async function cancelOrderByFarmer(params: {
  orderId: string
  farmerId: string
}) {
  const supabase = await createClient()
  const { data: order, error: e0 } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', params.orderId)
    .eq('farmer_id', params.farmerId)
    .maybeSingle()

  if (e0) throw new Error(e0.message)
  if (!order) throw new Error('Pedido no encontrado.')
  if (order.status !== 'pending') {
    throw new Error('Solo puedes cancelar pedidos pendientes.')
  }

  const { error } = await supabase
    .from('orders')
    .update({
      status: 'cancelled' as OrderStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.orderId)

  if (error) throw new Error(error.message)
}

export type WarehouseOrderRow = {
  id: string
  order_number: string
  status: OrderStatus
  total: number | string
  created_at: string
  farmer_id: string
  users: { name: string; phone: string } | null
}

function userFromJoin(raw: unknown): { name: string; phone: string } | null {
  const u = Array.isArray(raw) ? raw[0] : raw
  if (typeof u !== 'object' || u === null) return null
  const o = u as Record<string, unknown>
  const name = o.name
  const phone = o.phone
  if (typeof name !== 'string' || typeof phone !== 'string') return null
  return { name, phone }
}

export async function listWarehouseOrders(
  warehouseUserId: string,
  status?: OrderStatus
): Promise<WarehouseOrderRow[]> {
  const supabase = await createClient()
  const { data: wh } = await supabase
    .from('warehouses')
    .select('id')
    .eq('user_id', warehouseUserId)
    .maybeSingle()

  if (!wh) return []

  let q = supabase
    .from('orders')
    .select(
      'id, order_number, status, total, subtotal, created_at, confirmed_at, farmer_id, users ( name, phone )'
    )
    .eq('warehouse_id', wh.id)
    .order('created_at', { ascending: false })

  if (status) q = q.eq('status', status)

  const { data, error } = await q
  if (error) throw new Error(error.message)

  const out: WarehouseOrderRow[] = []
  for (const row of data ?? []) {
    if (typeof row !== 'object' || row === null) continue
    const r = row as Record<string, unknown>
    const id = r.id
    const order_number = r.order_number
    const st = r.status
    const total = r.total
    const created_at = r.created_at
    const farmer_id = r.farmer_id
    if (
      typeof id !== 'string' ||
      typeof order_number !== 'string' ||
      typeof st !== 'string' ||
      typeof created_at !== 'string' ||
      typeof farmer_id !== 'string'
    ) {
      continue
    }
    if (!isOrderStatus(st)) continue
    out.push({
      id,
      order_number,
      status: st,
      total: typeof total === 'number' || typeof total === 'string' ? total : 0,
      created_at,
      farmer_id,
      users: userFromJoin(r.users),
    })
  }
  return out
}

function isOrderStatus(s: string): s is OrderStatus {
  return (
    s === 'pending' ||
    s === 'confirmed' ||
    s === 'rejected' ||
    s === 'delivered' ||
    s === 'cancelled'
  )
}

export async function warehouseDashboardSummary(warehouseUserId: string) {
  const supabase = await createClient()
  const { data: wh } = await supabase
    .from('warehouses')
    .select('id')
    .eq('user_id', warehouseUserId)
    .maybeSingle()

  if (!wh) return { pending: 0, revenueToday: 0 }

  const { count: pending } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('warehouse_id', wh.id)
    .eq('status', 'pending')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { data: confirmed } = await supabase
    .from('orders')
    .select('total, confirmed_at')
    .eq('warehouse_id', wh.id)
    .eq('status', 'confirmed')
    .gte('confirmed_at', today.toISOString())

  const revenueToday = (confirmed ?? []).reduce(
    (s, p) => s + Number(p.total),
    0
  )

  return {
    pending: pending ?? 0,
    revenueToday,
  }
}

export async function createOrderAdmin(params: {
  farmerId: string
  warehouseId: string
  channel: Channel
  notes?: string
  items: OrderLineInput[]
}) {
  const admin = createAdminClient()
  const { data: warehouse, error: eWh } = await admin
    .from('warehouses')
    .select('id, active, accepts_digital_orders')
    .eq('id', params.warehouseId)
    .maybeSingle()

  if (eWh) throw new Error(eWh.message)
  if (!warehouse?.active) throw new Error('Almacén no disponible.')

  let subtotal = 0
  const lines: {
    product_id: string
    quantity: number
    unit_price: number
    subtotal: number
  }[] = []

  for (const it of params.items) {
    const { data: price, error: eP } = await admin
      .from('prices')
      .select('unit_price, is_available')
      .eq('product_id', it.product_id)
      .eq('warehouse_id', params.warehouseId)
      .maybeSingle()

    if (eP) throw new Error(eP.message)
    if (!price?.is_available) throw new Error('Producto no disponible.')
    const pu = Number(price.unit_price)
    const st = pu * it.quantity
    subtotal += st
    lines.push({
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price: pu,
      subtotal: st,
    })
  }

  await ensureFarmerUserRowBeforeAdminOrder(params.farmerId)

  const { data: order, error: eOrd } = await admin
    .from('orders')
    .insert({
      order_number: tempOrderNumber(),
      farmer_id: params.farmerId,
      warehouse_id: params.warehouseId,
      channel: params.channel,
      subtotal,
      commission: 0,
      total: subtotal,
      notes: params.notes ?? null,
      status: 'pending' as OrderStatus,
    })
    .select('id, order_number')
    .single()

  if (eOrd) throw new Error(friendlyDbError(eOrd))
  if (!order) throw new Error('No se creó el pedido.')

  const orderId = order.id as string
  const orderNumber = order.order_number as string

  const { error: eItems } = await admin.from('order_items').insert(
    lines.map((l) => ({
      order_id: orderId,
      product_id: l.product_id,
      quantity: l.quantity,
      unit_price: l.unit_price,
      subtotal: l.subtotal,
    }))
  )

  if (eItems) {
    await admin.from('orders').delete().eq('id', orderId)
    throw new Error(friendlyDbError(eItems))
  }

  return { orderId, orderNumber, subtotal, total: subtotal }
}

export async function confirmOrderByWhatsAppAdmin(orderId: string) {
  const admin = createAdminClient()
  const { data: order, error: e0 } = await admin
    .from('orders')
    .select('id, status, warehouse_id, subtotal')
    .eq('id', orderId)
    .maybeSingle()

  if (e0) throw new Error(e0.message)
  if (!order || order.status !== 'pending') {
    throw new Error('Pedido no confirmable.')
  }

  const { data: wh } = await admin
    .from('warehouses')
    .select('commission_percentage')
    .eq('id', order.warehouse_id as string)
    .maybeSingle()

  const subtotal = Number(order.subtotal)
  const pct = Number(wh?.commission_percentage ?? 0)
  const commission = Math.round((subtotal * pct) / 100 * 100) / 100

  const { error } = await admin
    .from('orders')
    .update({
      status: 'confirmed' as OrderStatus,
      warehouse_confirmed_price: subtotal,
      commission,
      total: subtotal,
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) throw new Error(error.message)
}

export async function rejectOrderByWhatsAppAdmin(
  orderId: string,
  reason: string
) {
  const admin = createAdminClient()
  const { error } = await admin
    .from('orders')
    .update({
      status: 'rejected' as OrderStatus,
      warehouse_notes: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('status', 'pending')

  if (error) throw new Error(error.message)
}
