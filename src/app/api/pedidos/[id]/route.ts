import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  updateOrderByWarehouse,
  cancelOrderByFarmer,
  getOrderForUser,
} from '@/lib/pedidos/service'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import { recordFarmerWhatsappNotifyOutcome } from '@/lib/pedidos/farmer-whatsapp-notify'
import { isUuid } from '@/lib/catalogo/uuid'

/**
 * Farmer phone for outbound WhatsApp: prefer service role so RLS on `users` cannot hide the row.
 */
async function getFarmerPhoneForWhatsApp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  farmerId: string
): Promise<string | undefined> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('users')
      .select('phone')
      .eq('id', farmerId)
      .maybeSingle()
    const p = data?.phone
    if (typeof p === 'string' && p.trim().length > 0) return p.trim()
  } catch (e) {
    console.warn(
      '[orders] admin read users.phone failed, falling back to session client:',
      e instanceof Error ? e.message : e
    )
  }

  const { data } = await supabase
    .from('users')
    .select('phone')
    .eq('id', farmerId)
    .maybeSingle()
  const p = data?.phone
  if (typeof p === 'string' && p.trim().length > 0) return p.trim()
  return undefined
}

/** Body shape for PATCH /api/pedidos/[id] */
type PatchBody = {
  action?: 'confirm' | 'reject' | 'deliver' | 'cancel'
  confirmed_price?: number
  warehouse_notes?: string
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
    const action = body.action
    const role = user.user_metadata?.role as string | undefined

    // Farmer cancels their own order
    if (action === 'cancel') {
      if (role === 'warehouse') {
        return NextResponse.json({ error: 'No permitido.' }, { status: 403 })
      }
      await cancelOrderByFarmer({ orderId: id, farmerId: user.id })
      return NextResponse.json({ ok: true })
    }

    // Warehouse actions: confirm, reject, deliver
    if (action === 'confirm' || action === 'reject' || action === 'deliver') {
      if (role !== 'warehouse' && role !== 'admin') {
        return NextResponse.json({ error: 'No permitido.' }, { status: 403 })
      }

      const confirmedPrice =
        typeof body.confirmed_price === 'number' ? body.confirmed_price : undefined
      const warehouseNotes =
        typeof body.warehouse_notes === 'string' ? body.warehouse_notes : undefined

      const out = await updateOrderByWarehouse({
        orderId: id,
        warehouseUserId: user.id,
        action,
        confirmedPrice,
        warehouseNotes,
      })

      // Notify farmer via WhatsApp when order is confirmed or rejected
      if (action === 'confirm' || action === 'reject') {
        const { data: orderRow } = await supabase
          .from('orders')
          .select('order_number, farmer_id')
          .eq('id', id)
          .maybeSingle()

        const farmerId =
          orderRow &&
          typeof orderRow === 'object' &&
          'farmer_id' in orderRow &&
          typeof (orderRow as { farmer_id?: unknown }).farmer_id === 'string'
            ? (orderRow as { farmer_id: string }).farmer_id
            : null

        const phone = farmerId ? await getFarmerPhoneForWhatsApp(supabase, farmerId) : undefined

        const num =
          orderRow &&
          typeof orderRow === 'object' &&
          'order_number' in orderRow &&
          typeof (orderRow as { order_number?: unknown }).order_number === 'string'
            ? (orderRow as { order_number: string }).order_number
            : id
        const msg =
          action === 'confirm'
            ? `Tu pedido ${num} fue confirmado por el almacén. GranoVivo.`
            : `Tu pedido ${num} no pudo ser atendido. Motivo: ${warehouseNotes ?? '—'}. GranoVivo.`

        if (!phone) {
          console.warn(
            '[orders] WhatsApp skipped: no phone in users for farmer_id',
            farmerId ?? '(missing)'
          )
          await recordFarmerWhatsappNotifyOutcome({
            orderId: id,
            status: 'skipped_no_phone',
          })
        } else {
          const result = await sendWhatsAppMessage(phone, msg)
          if (!result.ok) {
            console.warn('[orders] WhatsApp send failed:', result.error ?? 'unknown')
            await recordFarmerWhatsappNotifyOutcome({
              orderId: id,
              status: 'failed',
              errorHint: result.error,
            })
          } else {
            await recordFarmerWhatsappNotifyOutcome({
              orderId: id,
              status: 'sent',
            })
          }
        }
      }

      return NextResponse.json({ ok: true, ...out })
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
