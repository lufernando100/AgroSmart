import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { crearPedido } from '@/lib/pedidos/service'
import { enviarMensajeWhatsApp } from '@/lib/whatsapp/send'
import { isUuid } from '@/lib/catalogo/uuid'
import { friendlyDbError } from '@/lib/utils/db-errors'
import type { ConversacionCanal } from '@/types/database'

/** Longitud máxima para el campo notas (WhatsApp soporta hasta 4096, pero 500 es suficiente). */
const NOTAS_MAX_LEN = 500
/** Cantidad mínima y máxima por ítem de pedido. */
const CANTIDAD_MIN = 1
const CANTIDAD_MAX = 9_999

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

    const rol = user.user_metadata?.rol as string | undefined
    if (rol === 'almacen') {
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

    const almacenId = json.almacen_id
    const items = json.items
    const canalRaw = json.canal

    if (typeof almacenId !== 'string' || !isUuid(almacenId)) {
      return NextResponse.json({ error: 'almacen_id inválido.' }, { status: 400 })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Debes enviar al menos un producto.' },
        { status: 400 }
      )
    }

    // Validar y sanitizar notas (máx 500 caracteres)
    let notas: string | undefined
    if (typeof json.notas === 'string') {
      const notasTrimmed = json.notas.trim()
      if (notasTrimmed.length > NOTAS_MAX_LEN) {
        return NextResponse.json(
          { error: `Las notas no pueden superar ${NOTAS_MAX_LEN} caracteres.` },
          { status: 400 }
        )
      }
      notas = notasTrimmed || undefined
    }

    // Validar ítems: UUID válido, cantidad entero entre 1 y 9999
    const parsedItems: { producto_id: string; cantidad: number }[] = []
    for (const it of items) {
      if (!isRecord(it)) continue
      const pid = it.producto_id
      const cant = it.cantidad

      if (typeof pid !== 'string' || !isUuid(pid)) continue

      if (
        typeof cant !== 'number' ||
        !Number.isInteger(cant) ||
        cant < CANTIDAD_MIN ||
        cant > CANTIDAD_MAX
      ) {
        return NextResponse.json(
          { error: `La cantidad debe ser un número entero entre ${CANTIDAD_MIN} y ${CANTIDAD_MAX}.` },
          { status: 400 }
        )
      }

      parsedItems.push({ producto_id: pid, cantidad: cant })
    }

    if (parsedItems.length === 0) {
      return NextResponse.json(
        { error: 'Los productos del pedido no son válidos.' },
        { status: 400 }
      )
    }

    const canal: ConversacionCanal =
      canalRaw === 'whatsapp' || canalRaw === 'pwa' ? canalRaw : 'pwa'

    const result = await crearPedido({
      caficultorId: user.id,
      almacenId: almacenId,
      canal,
      notas,
      items: parsedItems,
    })

    // Notificar al almacén por WhatsApp (no bloquea si falla)
    const { data: alm } = await supabase
      .from('almacenes')
      .select('nombre, telefono_whatsapp')
      .eq('id', almacenId)
      .maybeSingle()

    if (alm?.telefono_whatsapp) {
      try {
        await enviarMensajeWhatsApp(
          alm.telefono_whatsapp,
          `Nuevo pedido ${result.numero} en GranoVivo. Revisa el panel o responde por aquí.`
        )
      } catch {
        /* WhatsApp es opcional — continúa si faltan env vars */
      }
    }

    return NextResponse.json({
      id: result.pedidoId,
      numero: result.numero,
      subtotal: result.subtotal,
      total: result.total,
    })
  } catch (e) {
    const message =
      e instanceof Error ? e.message : friendlyDbError({})
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
