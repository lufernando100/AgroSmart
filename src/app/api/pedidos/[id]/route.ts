import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  actualizarPedidoAlmacen,
  cancelarPedidoCaficultor,
  obtenerPedidoParaUsuario,
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

    const rol = user.user_metadata?.rol as string | undefined
    const data = await obtenerPedidoParaUsuario(id, user.id, rol)
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
    const rol = user.user_metadata?.rol as string | undefined

    if (accion === 'cancelar') {
      if (rol === 'almacen') {
        return NextResponse.json({ error: 'No permitido.' }, { status: 403 })
      }
      await cancelarPedidoCaficultor({ pedidoId: id, caficultorId: user.id })
      return NextResponse.json({ ok: true })
    }

    if (
      accion === 'confirmar' ||
      accion === 'rechazar' ||
      accion === 'entregar'
    ) {
      if (rol !== 'almacen' && rol !== 'admin') {
        return NextResponse.json({ error: 'No permitido.' }, { status: 403 })
      }

      const precio =
        typeof body.precio_confirmado_almacen === 'number'
          ? body.precio_confirmado_almacen
          : undefined
      const notas =
        typeof body.notas_almacen === 'string' ? body.notas_almacen : undefined

      const out = await actualizarPedidoAlmacen({
        pedidoId: id,
        almacenUsuarioId: user.id,
        accion,
        precioConfirmado: precio,
        notasAlmacen: notas,
      })

      const { data: pedidoRow } = await supabase
        .from('pedidos')
        .select('numero, caficultor_id')
        .eq('id', id)
        .maybeSingle()

      const { data: cafi } = await supabase
        .from('usuarios')
        .select('telefono')
        .eq('id', pedidoRow?.caficultor_id as string)
        .maybeSingle()

      const telefono = cafi?.telefono as string | undefined

      if (telefono && (accion === 'confirmar' || accion === 'rechazar')) {
        const num = (pedidoRow as { numero?: string })?.numero ?? id
        const msg =
          accion === 'confirmar'
            ? `Tu pedido ${num} fue confirmado por el almacén. GranoVivo.`
            : `Tu pedido ${num} no pudo ser atendido. Motivo: ${notas ?? '—'}. GranoVivo.`
        try {
          await enviarMensajeWhatsApp(telefono, msg)
        } catch {
          /* opcional */
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
