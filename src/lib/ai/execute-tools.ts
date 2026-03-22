import { createAdminClient } from '@/lib/supabase/admin'
import { crearPedidoAdmin } from '@/lib/pedidos/service'
import { buscarProductosSoloTexto } from '@/lib/catalogo/queries'
import { enviarMensajeWhatsApp } from '@/lib/whatsapp/send'
import type { ConversacionCanal } from '@/types/database'

export type ToolResult = { name: string; result: unknown }

export async function ejecutarTool(params: {
  name: string
  input: Record<string, unknown>
  contexto: {
    caficultorId: string
    canal: ConversacionCanal
  }
}): Promise<ToolResult> {
  const { name, input, contexto } = params

  if (name === 'buscar_productos') {
    const termino = String(input.termino_busqueda ?? '')
    if (!termino.trim()) {
      return { name, result: { error: 'termino_busqueda vacío' } }
    }
    const data = await buscarProductosSoloTexto({
      busqueda: termino,
      sector: 'cafe',
    })
    return {
      name,
      result: { productos: data.slice(0, 15) },
    }
  }

  if (name === 'crear_pedido') {
    const almacenId = String(input.almacen_id ?? '')
    const itemsRaw = input.items
    const canal =
      input.canal === 'whatsapp' || input.canal === 'pwa'
        ? input.canal
        : contexto.canal
    const notas =
      typeof input.notas === 'string' ? input.notas : undefined

    if (!Array.isArray(itemsRaw)) {
      return { name, result: { error: 'items inválidos' } }
    }

    const items: { producto_id: string; cantidad: number }[] = []
    for (const row of itemsRaw) {
      if (
        typeof row === 'object' &&
        row !== null &&
        'producto_id' in row &&
        'cantidad' in row
      ) {
        const r = row as { producto_id: string; cantidad: number }
        items.push({
          producto_id: String(r.producto_id),
          cantidad: Number(r.cantidad),
        })
      }
    }

    const caficultorId =
      String(input.caficultor_id ?? '') || contexto.caficultorId

    const out = await crearPedidoAdmin({
      caficultorId,
      almacenId,
      canal,
      notas,
      items,
    })

    const admin = createAdminClient()
    const { data: alm } = await admin
      .from('almacenes')
      .select('telefono_whatsapp, nombre')
      .eq('id', almacenId)
      .maybeSingle()

    if (alm?.telefono_whatsapp) {
      try {
        await enviarMensajeWhatsApp(
          alm.telefono_whatsapp,
          `Nuevo pedido ${out.numero} en GranoVivo. Productos: ${items.length} línea(s).`
        )
      } catch {
        /* opcional */
      }
    }

    return {
      name,
      result: {
        pedido_id: out.pedidoId,
        numero: out.numero,
        total: out.total,
        almacen: alm?.nombre,
      },
    }
  }

  if (name === 'notificar_almacen') {
    const telefono = String(input.telefono_whatsapp ?? '')
    const mensaje = String(input.mensaje ?? '')
    if (!telefono || !mensaje) {
      return { name, result: { error: 'telefono o mensaje faltante' } }
    }
    const r = await enviarMensajeWhatsApp(telefono, mensaje)
    return { name, result: r }
  }

  return { name, result: { error: `Tool desconocida: ${name}` } }
}
