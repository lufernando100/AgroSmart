import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrdersForFarmer } from '@/lib/pedidos/service'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { isUuid } from '@/lib/catalogo/uuid'
import { friendlyDbError } from '@/lib/utils/db-errors'
import { buildNewOrderWhatsAppMessage } from '@/lib/pedidos/whatsapp-order-summary'
import type { Channel } from '@/types/database'

const NOTES_MAX_LEN = 500
const QTY_MIN = 1
const QTY_MAX = 9_999

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

type ParsedLine = { warehouse_id: string; product_id: string; quantity: number }

function parseQuantity(raw: unknown): number | null {
  if (typeof raw !== 'number' || !Number.isInteger(raw)) return null
  if (raw < QTY_MIN || raw > QTY_MAX) return null
  return raw
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

    const channelRaw = json.channel

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

    const defaultWarehouseId =
      typeof json.warehouse_id === 'string' && isUuid(json.warehouse_id)
        ? json.warehouse_id
        : undefined

    const lines: ParsedLine[] = []

    const itemsRaw = json.items
    const legacyProductId =
      typeof json.product_id === 'string' && isUuid(json.product_id)
        ? json.product_id
        : null
    const legacyQty = parseQuantity(json.quantity)

    if (Array.isArray(itemsRaw) && itemsRaw.length > 0) {
      for (const it of itemsRaw) {
        if (!isRecord(it)) {
          return NextResponse.json(
            { error: 'Cada ítem del pedido debe ser un objeto.' },
            { status: 400 }
          )
        }
        const pid =
          typeof it.product_id === 'string' && isUuid(it.product_id)
            ? it.product_id
            : null
        if (!pid) {
          return NextResponse.json(
            { error: 'Cada ítem debe incluir product_id válido.' },
            { status: 400 }
          )
        }
        const qty = parseQuantity(it.quantity)
        if (qty === null) {
          return NextResponse.json(
            {
              error: `La cantidad debe ser un número entero entre ${QTY_MIN} y ${QTY_MAX}.`,
            },
            { status: 400 }
          )
        }

        const wid =
          typeof it.warehouse_id === 'string' && isUuid(it.warehouse_id)
            ? it.warehouse_id
            : defaultWarehouseId

        if (!wid) {
          return NextResponse.json(
            {
              error:
                'Cada producto debe tener almacén, o envía warehouse_id en la raíz del JSON.',
            },
            { status: 400 }
          )
        }

        lines.push({ warehouse_id: wid, product_id: pid, quantity: qty })
      }
    } else if (
      legacyProductId &&
      defaultWarehouseId &&
      legacyQty !== null
    ) {
      lines.push({
        warehouse_id: defaultWarehouseId,
        product_id: legacyProductId,
        quantity: legacyQty,
      })
    }

    if (lines.length === 0) {
      return NextResponse.json(
        {
          error:
            'Debes enviar items (array) o product_id + warehouse_id + quantity.',
        },
        { status: 400 }
      )
    }

    const channel: Channel =
      channelRaw === 'whatsapp' || channelRaw === 'pwa' ? channelRaw : 'pwa'

    const result = await createOrdersForFarmer({
      farmerId: user.id,
      channel,
      notes,
      lines,
    })

    for (const o of result.orders) {
      const { data: wh } = await supabase
        .from('warehouses')
        .select('whatsapp_phone')
        .eq('id', o.warehouseId)
        .maybeSingle()

      if (wh?.whatsapp_phone) {
        try {
          const msg = await buildNewOrderWhatsAppMessage(supabase, o.orderId)
          await sendWhatsAppMessage(
            wh.whatsapp_phone as string,
            msg ??
              `Nuevo pedido ${o.orderNumber} en GranoVivo. Revisa el panel o responde por aquí.`
          )
        } catch {
          /* WhatsApp optional */
        }
      }
    }

    const first = result.orders[0]
    return NextResponse.json({
      orders: result.orders.map((o) => ({
        id: o.orderId,
        order_number: o.orderNumber,
        warehouse_id: o.warehouseId,
        subtotal: o.subtotal,
        total: o.total,
      })),
      grand_total: result.total,
      id: first?.orderId,
      order_number: first?.orderNumber,
      subtotal: first?.subtotal,
      total: first?.total,
    })
  } catch (e) {
    const message =
      e instanceof Error ? e.message : friendlyDbError({})
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
