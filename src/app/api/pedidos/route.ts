import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrder } from '@/lib/pedidos/service'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { isUuid } from '@/lib/catalogo/uuid'
import { friendlyDbError } from '@/lib/utils/db-errors'
import type { Channel } from '@/types/database'

const NOTES_MAX_LEN = 500
const QTY_MIN = 1
const QTY_MAX = 9_999

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    const role = user.user_metadata?.role as string | undefined
    if (role === 'warehouse') {
      return NextResponse.json(
        { error: 'Los almacenes no crean pedidos desde esta ruta.' },
        { status: 403 }
      )
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

    const warehouseId = json.warehouse_id
    const items = json.items
    const channelRaw = json.channel

    if (typeof warehouseId !== 'string' || !isUuid(warehouseId)) {
      return NextResponse.json({ error: 'warehouse_id inválido.' }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Debes enviar al menos un producto.' },
        { status: 400 }
      )
    }

    let notes: string | undefined
    if (typeof json.notes === 'string') {
      const trimmed = json.notes.trim()
      if (trimmed.length > NOTES_MAX_LEN) {
        return NextResponse.json(
          { error: `Las notas no pueden superar ${NOTES_MAX_LEN} caracteres.` },
          { status: 400 }
        )
      }
      notes = trimmed || undefined
    }

    const parsedItems: { product_id: string; quantity: number }[] = []
    for (const it of items) {
      if (!isRecord(it)) continue
      const pid = it.product_id
      const qty = it.quantity

      if (typeof pid !== 'string' || !isUuid(pid)) continue

      if (
        typeof qty !== 'number' ||
        !Number.isInteger(qty) ||
        qty < QTY_MIN ||
        qty > QTY_MAX
      ) {
        return NextResponse.json(
          {
            error: `La cantidad debe ser un número entero entre ${QTY_MIN} y ${QTY_MAX}.`,
          },
          { status: 400 }
        )
      }

      parsedItems.push({ product_id: pid, quantity: qty })
    }

    if (parsedItems.length === 0) {
      return NextResponse.json(
        { error: 'Los productos del pedido no son válidos.' },
        { status: 400 }
      )
    }

    const channel: Channel =
      channelRaw === 'whatsapp' || channelRaw === 'pwa' ? channelRaw : 'pwa'

    const result = await createOrder({
      farmerId: user.id,
      warehouseId,
      channel,
      notes,
      items: parsedItems,
    })

    const { data: wh } = await supabase
      .from('warehouses')
      .select('name, whatsapp_phone')
      .eq('id', warehouseId)
      .maybeSingle()

    if (wh?.whatsapp_phone) {
      try {
        await sendWhatsAppMessage(
          wh.whatsapp_phone,
          `Nuevo pedido ${result.orderNumber} en GranoVivo. Revisa el panel o responde por aquí.`
        )
      } catch {
        /* WhatsApp optional */
      }
    }

    return NextResponse.json({
      id: result.orderId,
      order_number: result.orderNumber,
      subtotal: result.subtotal,
      total: result.total,
    })
  } catch (e) {
    const message =
      e instanceof Error ? e.message : friendlyDbError({})
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
