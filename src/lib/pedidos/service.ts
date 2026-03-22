import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { friendlyDbError } from '@/lib/utils/db-errors'
import type { ConversacionCanal, PedidoEstado } from '@/types/database'

export type ItemPedidoInput = {
  producto_id: string
  cantidad: number
}

function tempNumero(): string {
  return `T-${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`
}

export async function crearPedido(params: {
  caficultorId: string
  almacenId: string
  canal: ConversacionCanal
  notas?: string
  items: ItemPedidoInput[]
}): Promise<{ pedidoId: string; numero: string; total: number; subtotal: number }> {
  if (params.items.length === 0) {
    throw new Error('El pedido debe tener al menos un producto.')
  }

  const supabase = await createClient()

  const { data: almacen, error: eAlm } = await supabase
    .from('almacenes')
    .select('id, comision_porcentaje, activo, acepta_pedidos_digitales')
    .eq('id', params.almacenId)
    .maybeSingle()

  if (eAlm) throw new Error(eAlm.message)
  if (!almacen?.activo) throw new Error('El almacén no está disponible.')
  if (almacen.acepta_pedidos_digitales === false) {
    throw new Error('Este almacén no acepta pedidos digitales.')
  }

  let subtotal = 0
  const lineas: {
    producto_id: string
    cantidad: number
    precio_unitario: number
    subtotal: number
  }[] = []

  for (const it of params.items) {
    if (it.cantidad < 1) throw new Error('Cantidad inválida.')
    const { data: precio, error: eP } = await supabase
      .from('precios')
      .select('precio_unitario, disponible')
      .eq('producto_id', it.producto_id)
      .eq('almacen_id', params.almacenId)
      .maybeSingle()

    if (eP) throw new Error(eP.message)
    if (!precio?.disponible) {
      throw new Error('Un producto no está disponible en este almacén.')
    }

    const pu = Number(precio.precio_unitario)
    const st = pu * it.cantidad
    subtotal += st
    lineas.push({
      producto_id: it.producto_id,
      cantidad: it.cantidad,
      precio_unitario: pu,
      subtotal: st,
    })
  }

  // Verificar que el caficultor existe en public.usuarios antes de insertar.
  // Esto previene el FK violation "pedidos_caficultor_id_fkey" que muestra
  // mensajes crudos de Postgres al usuario.
  const { data: caficultorRow } = await supabase
    .from('usuarios')
    .select('id')
    .eq('id', params.caficultorId)
    .maybeSingle()

  if (!caficultorRow) {
    throw new Error(
      'Tu perfil no está listo. Cierra sesión, vuelve a entrar e intenta de nuevo.'
    )
  }

  const total = subtotal
  const comision = 0

  const { data: pedido, error: ePed } = await supabase
    .from('pedidos')
    .insert({
      numero: tempNumero(),
      caficultor_id: params.caficultorId,
      almacen_id: params.almacenId,
      canal: params.canal,
      subtotal,
      comision,
      total,
      notas: params.notas ?? null,
      estado: 'pendiente' as PedidoEstado,
    })
    .select('id, numero')
    .single()

  if (ePed) throw new Error(friendlyDbError(ePed))
  if (!pedido) throw new Error('No se pudo crear el pedido.')

  const pedidoId = pedido.id as string
  const numero = pedido.numero as string

  const inserts = lineas.map((l) => ({
    pedido_id: pedidoId,
    producto_id: l.producto_id,
    cantidad: l.cantidad,
    precio_unitario: l.precio_unitario,
    subtotal: l.subtotal,
  }))

  const { error: eItems } = await supabase.from('pedido_items').insert(inserts)
  if (eItems) {
    await supabase.from('pedidos').delete().eq('id', pedidoId)
    throw new Error(friendlyDbError(eItems))
  }

  return { pedidoId, numero, total, subtotal }
}

export async function obtenerPedidoParaUsuario(
  pedidoId: string,
  userId: string,
  rol: string | undefined
) {
  const supabase = await createClient()
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select(
      'id, numero, estado, canal, subtotal, comision, total, precio_confirmado_almacen, notas, notas_almacen, confirmado_at, entregado_at, created_at, caficultor_id, almacen_id, almacenes ( nombre, telefono_whatsapp, municipio )'
    )
    .eq('id', pedidoId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!pedido) return null

  if (rol === 'almacen' || rol === 'admin') {
    const { data: alm } = await supabase
      .from('almacenes')
      .select('id')
      .eq('usuario_id', userId)
      .maybeSingle()
    if (rol !== 'admin' && pedido.almacen_id !== alm?.id) return null
  } else if (pedido.caficultor_id !== userId) {
    return null
  }

  const { data: items } = await supabase
    .from('pedido_items')
    .select(
      'id, cantidad, precio_unitario, subtotal, productos ( id, nombre, nombre_corto, presentacion, unidad_medida )'
    )
    .eq('pedido_id', pedidoId)

  return { pedido, items: items ?? [] }
}

export async function actualizarPedidoAlmacen(params: {
  pedidoId: string
  almacenUsuarioId: string
  accion: 'confirmar' | 'rechazar' | 'entregar'
  precioConfirmado?: number
  notasAlmacen?: string
}) {
  const supabase = await createClient()

  const { data: alm } = await supabase
    .from('almacenes')
    .select('id, comision_porcentaje')
    .eq('usuario_id', params.almacenUsuarioId)
    .maybeSingle()

  if (!alm) throw new Error('No se encontró almacén asociado a tu cuenta.')

  const { data: pedido, error: e0 } = await supabase
    .from('pedidos')
    .select('id, estado, almacen_id, subtotal')
    .eq('id', params.pedidoId)
    .maybeSingle()

  if (e0) throw new Error(e0.message)
  if (!pedido || pedido.almacen_id !== alm.id) {
    throw new Error('Pedido no encontrado o sin permiso.')
  }

  const estado = pedido.estado as PedidoEstado
  const subtotal = Number(pedido.subtotal)

  if (params.accion === 'confirmar') {
    if (estado !== 'pendiente') throw new Error('Solo se pueden confirmar pedidos pendientes.')
    const pct = Number(alm.comision_porcentaje ?? 0)
    const precioConf =
      params.precioConfirmado != null ? params.precioConfirmado : subtotal
    const comision = Math.round((subtotal * pct) / 100 * 100) / 100
    const { error: e1 } = await supabase
      .from('pedidos')
      .update({
        estado: 'confirmado' as PedidoEstado,
        precio_confirmado_almacen: precioConf,
        comision,
        total: subtotal,
        confirmado_at: new Date().toISOString(),
        notas_almacen: params.notasAlmacen ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.pedidoId)
    if (e1) throw new Error(e1.message)
    return { estado: 'confirmado' as const }
  }

  if (params.accion === 'rechazar') {
    if (estado !== 'pendiente') throw new Error('Solo se pueden rechazar pedidos pendientes.')
    const { error: e2 } = await supabase
      .from('pedidos')
      .update({
        estado: 'rechazado' as PedidoEstado,
        notas_almacen: params.notasAlmacen ?? 'Rechazado',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.pedidoId)
    if (e2) throw new Error(e2.message)
    return { estado: 'rechazado' as const }
  }

  if (params.accion === 'entregar') {
    if (estado !== 'confirmado') {
      throw new Error('Solo se pueden entregar pedidos confirmados.')
    }
    const { error: e3 } = await supabase
      .from('pedidos')
      .update({
        estado: 'entregado' as PedidoEstado,
        entregado_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.pedidoId)
    if (e3) throw new Error(e3.message)
    return { estado: 'entregado' as const }
  }

  throw new Error('Acción no válida.')
}

export async function cancelarPedidoCaficultor(params: {
  pedidoId: string
  caficultorId: string
}) {
  const supabase = await createClient()
  const { data: pedido, error: e0 } = await supabase
    .from('pedidos')
    .select('id, estado')
    .eq('id', params.pedidoId)
    .eq('caficultor_id', params.caficultorId)
    .maybeSingle()

  if (e0) throw new Error(e0.message)
  if (!pedido) throw new Error('Pedido no encontrado.')
  if (pedido.estado !== 'pendiente') {
    throw new Error('Solo puedes cancelar pedidos pendientes.')
  }

  const { error } = await supabase
    .from('pedidos')
    .update({
      estado: 'cancelado' as PedidoEstado,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.pedidoId)

  if (error) throw new Error(error.message)
}

export type PedidoAlmacenLista = {
  id: string
  numero: string
  estado: PedidoEstado
  total: number | string
  created_at: string
  caficultor_id: string
  usuarios: { nombre: string; telefono: string } | null
}

function usuarioDesdeJoin(raw: unknown): { nombre: string; telefono: string } | null {
  const u = Array.isArray(raw) ? raw[0] : raw
  if (typeof u !== 'object' || u === null) return null
  const o = u as Record<string, unknown>
  const nombre = o.nombre
  const telefono = o.telefono
  if (typeof nombre !== 'string' || typeof telefono !== 'string') return null
  return { nombre, telefono }
}

/** Pedidos del almacén (usuario dueño) por estado */
export async function listarPedidosAlmacen(
  usuarioAlmacenId: string,
  estado?: PedidoEstado
): Promise<PedidoAlmacenLista[]> {
  const supabase = await createClient()
  const { data: alm } = await supabase
    .from('almacenes')
    .select('id')
    .eq('usuario_id', usuarioAlmacenId)
    .maybeSingle()

  if (!alm) return []

  let q = supabase
    .from('pedidos')
    .select(
      'id, numero, estado, total, subtotal, created_at, confirmado_at, caficultor_id, usuarios ( nombre, telefono )'
    )
    .eq('almacen_id', alm.id)
    .order('created_at', { ascending: false })

  if (estado) q = q.eq('estado', estado)

  const { data, error } = await q
  if (error) throw new Error(error.message)

  const out: PedidoAlmacenLista[] = []
  for (const row of data ?? []) {
    if (typeof row !== 'object' || row === null) continue
    const r = row as Record<string, unknown>
    const id = r.id
    const numero = r.numero
    const estado = r.estado
    const total = r.total
    const created_at = r.created_at
    const caficultor_id = r.caficultor_id
    if (
      typeof id !== 'string' ||
      typeof numero !== 'string' ||
      typeof estado !== 'string' ||
      typeof created_at !== 'string' ||
      typeof caficultor_id !== 'string'
    ) {
      continue
    }
    if (!isPedidoEstado(estado)) continue
    out.push({
      id,
      numero,
      estado,
      total: typeof total === 'number' || typeof total === 'string' ? total : 0,
      created_at,
      caficultor_id,
      usuarios: usuarioDesdeJoin(r.usuarios),
    })
  }
  return out
}

function isPedidoEstado(s: string): s is PedidoEstado {
  return (
    s === 'pendiente' ||
    s === 'confirmado' ||
    s === 'rechazado' ||
    s === 'entregado' ||
    s === 'cancelado'
  )
}

export async function resumenDashboardAlmacen(usuarioAlmacenId: string) {
  const supabase = await createClient()
  const { data: alm } = await supabase
    .from('almacenes')
    .select('id')
    .eq('usuario_id', usuarioAlmacenId)
    .maybeSingle()

  if (!alm) return { pendientes: 0, ingresosHoy: 0 }

  const { count: pendientes } = await supabase
    .from('pedidos')
    .select('id', { count: 'exact', head: true })
    .eq('almacen_id', alm.id)
    .eq('estado', 'pendiente')

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const { data: confirmados } = await supabase
    .from('pedidos')
    .select('total, confirmado_at')
    .eq('almacen_id', alm.id)
    .eq('estado', 'confirmado')
    .gte('confirmado_at', hoy.toISOString())

  const ingresosHoy = (confirmados ?? []).reduce(
    (s, p) => s + Number(p.total),
    0
  )

  return {
    pendientes: pendientes ?? 0,
    ingresosHoy,
  }
}

/** Admin: crear pedido (p. ej. WhatsApp) con mismo cálculo de precios */
export async function crearPedidoAdmin(params: {
  caficultorId: string
  almacenId: string
  canal: ConversacionCanal
  notas?: string
  items: ItemPedidoInput[]
}) {
  const admin = createAdminClient()
  const { data: almacen, error: eAlm } = await admin
    .from('almacenes')
    .select('id, activo, acepta_pedidos_digitales')
    .eq('id', params.almacenId)
    .maybeSingle()

  if (eAlm) throw new Error(eAlm.message)
  if (!almacen?.activo) throw new Error('Almacén no disponible.')

  let subtotal = 0
  const lineas: {
    producto_id: string
    cantidad: number
    precio_unitario: number
    subtotal: number
  }[] = []

  for (const it of params.items) {
    const { data: precio, error: eP } = await admin
      .from('precios')
      .select('precio_unitario, disponible')
      .eq('producto_id', it.producto_id)
      .eq('almacen_id', params.almacenId)
      .maybeSingle()

    if (eP) throw new Error(eP.message)
    if (!precio?.disponible) throw new Error('Producto no disponible.')
    const pu = Number(precio.precio_unitario)
    const st = pu * it.cantidad
    subtotal += st
    lineas.push({
      producto_id: it.producto_id,
      cantidad: it.cantidad,
      precio_unitario: pu,
      subtotal: st,
    })
  }

  // Verificar que el caficultor existe en public.usuarios (previene FK error crudo).
  const { data: caficultorAdminRow } = await admin
    .from('usuarios')
    .select('id')
    .eq('id', params.caficultorId)
    .maybeSingle()

  if (!caficultorAdminRow) {
    throw new Error(
      'Tu perfil no está listo. Cierra sesión, vuelve a entrar e intenta de nuevo.'
    )
  }

  const { data: pedido, error: ePed } = await admin
    .from('pedidos')
    .insert({
      numero: tempNumero(),
      caficultor_id: params.caficultorId,
      almacen_id: params.almacenId,
      canal: params.canal,
      subtotal,
      comision: 0,
      total: subtotal,
      notas: params.notas ?? null,
      estado: 'pendiente' as PedidoEstado,
    })
    .select('id, numero')
    .single()

  if (ePed) throw new Error(friendlyDbError(ePed))
  if (!pedido) throw new Error('No se creó el pedido.')

  const pedidoId = pedido.id as string
  const numero = pedido.numero as string

  const { error: eItems } = await admin.from('pedido_items').insert(
    lineas.map((l) => ({
      pedido_id: pedidoId,
      producto_id: l.producto_id,
      cantidad: l.cantidad,
      precio_unitario: l.precio_unitario,
      subtotal: l.subtotal,
    }))
  )

  if (eItems) {
    await admin.from('pedidos').delete().eq('id', pedidoId)
    throw new Error(friendlyDbError(eItems))
  }

  return { pedidoId, numero, subtotal, total: subtotal }
}

/** Confirmación rápida vía WhatsApp (SI) — sin sesión web */
export async function confirmarPedidoPorWhatsAppAdmin(pedidoId: string) {
  const admin = createAdminClient()
  const { data: pedido, error: e0 } = await admin
    .from('pedidos')
    .select('id, estado, almacen_id, subtotal')
    .eq('id', pedidoId)
    .maybeSingle()

  if (e0) throw new Error(e0.message)
  if (!pedido || pedido.estado !== 'pendiente') {
    throw new Error('Pedido no confirmable.')
  }

  const { data: alm } = await admin
    .from('almacenes')
    .select('comision_porcentaje')
    .eq('id', pedido.almacen_id as string)
    .maybeSingle()

  const subtotal = Number(pedido.subtotal)
  const pct = Number(alm?.comision_porcentaje ?? 0)
  const comision = Math.round((subtotal * pct) / 100 * 100) / 100

  const { error } = await admin
    .from('pedidos')
    .update({
      estado: 'confirmado' as PedidoEstado,
      precio_confirmado_almacen: subtotal,
      comision,
      total: subtotal,
      confirmado_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', pedidoId)

  if (error) throw new Error(error.message)
}

export async function rechazarPedidoPorWhatsAppAdmin(
  pedidoId: string,
  motivo: string
) {
  const admin = createAdminClient()
  const { error } = await admin
    .from('pedidos')
    .update({
      estado: 'rechazado' as PedidoEstado,
      notas_almacen: motivo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', pedidoId)
    .eq('estado', 'pendiente')

  if (error) throw new Error(error.message)
}
