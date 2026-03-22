import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  updateOrderByWarehouse,
  cancelOrderByFarmer,
  getOrderForUser,
} from '@/lib/pedidos/service'
import { enviarMensajeWhatsApp } from '@/lib/whatsapp/send'
import { isUuid } from '@/lib/catalogo/uuid'

type PatchBody = {
  accion?: 'confirmar' | 'rechazar' | 'entregar' | 'cancelar'
  precio_confirmado_almacen?: number
  notas_almacen?: string
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    const role = user.user_metadata?.role as string | undefined
    const data = await getOrderForUser(id, user.id, role)
    if (!data) {
      return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    let json: unknown
    try {
      json = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
    }

    if (!isRecord(json)) {
      return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 })
    }

    const body = json as PatchBody
    const accion = body.accion
    const role = user.user_metadata?.role as string | undefined

    if (accion === 'cancelar') {
      if (role === 'warehouse') {
        return NextResponse.json({ error: 'No permitido.' }, { status: 403 })
      }
      await cancelOrderByFarmer({ orderId: id, farmerId: user.id })
      return NextResponse.json({ ok: true })
    }

    if (
      accion === 'confirmar' ||
      accion === 'rechazar' ||
      accion === 'entregar'
    ) {
      if (role !== 'warehouse' && role !== 'admin') {
        return NextResponse.json({ error: 'No permitido.' }, { status: 403 })
      }

      const precio =
        typeof body.precio_confirmado_almacen === 'number'
          ? body.precio_confirmado_almacen
          : undefined
      const notas =
        typeof body.notas_almacen === 'string' ? body.notas_almacen : undefined

      const out = await updateOrderByWarehouse({
        orderId: id,
        warehouseUserId: user.id,
        action: accion,
        confirmedPrice: precio,
        warehouseNotes: notas,
      })

      const { data: orderRow } = await supabase
        .from('orders')
        .select('order_number, farmer_id')
        .eq('id', id)
        .maybeSingle()

      const { data: farmer } = await supabase
        .from('users')
        .select('phone')
        .eq('id', orderRow?.farmer_id as string)
        .maybeSingle()

      const phone = farmer?.phone as string | undefined

      if (phone && (accion === 'confirmar' || accion === 'rechazar')) {
        const num = (orderRow as { order_number?: string })?.order_number ?? id
        const msg =
          accion === 'confirmar'
            ? `Tu pedido ${num} fue confirmado por el almacén. GranoVivo.`
            : `Tu pedido ${num} no pudo ser atendido. Motivo: ${notas ?? '—'}. GranoVivo.`
        try {
          await enviarMensajeWhatsApp(phone, msg)
        } catch {
          /* optional */
        }
      }

      return NextResponse.json({ ok: true, ...out })
    }

    return NextResponse.json({ error: 'accion inválida.' }, { status: 400 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
