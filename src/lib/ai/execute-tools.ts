import { createAdminClient } from '@/lib/supabase/admin'
import { createOrderAdmin } from '@/lib/pedidos/service'
import { searchProductsTextOnly } from '@/lib/catalogo/queries'
import { enviarMensajeWhatsApp } from '@/lib/whatsapp/send'
import type { Channel } from '@/types/database'

export type ToolResult = { name: string; result: unknown }

export async function ejecutarTool(params: {
  name: string
  input: Record<string, unknown>
  contexto: {
    farmerId: string
    channel: Channel
  }
}): Promise<ToolResult> {
  const { name, input, contexto } = params

  if (name === 'buscar_productos') {
    const termino = String(input.termino_busqueda ?? '')
    if (!termino.trim()) {
      return { name, result: { error: 'termino_busqueda vacío' } }
    }
    const data = await searchProductsTextOnly({
      search: termino,
      sector: 'coffee',
    })
    return {
      name,
      result: { productos: data.slice(0, 15) },
    }
  }

  if (name === 'crear_pedido') {
    const warehouseId = String(input.almacen_id ?? input.warehouse_id ?? '')
    const itemsRaw = input.items
    const canal =
      input.canal === 'whatsapp' || input.canal === 'pwa'
        ? input.canal
        : contexto.channel
    const notas =
      typeof input.notas === 'string' ? input.notas : undefined

    if (!Array.isArray(itemsRaw)) {
      return { name, result: { error: 'items inválidos' } }
    }

    const items: { product_id: string; quantity: number }[] = []
    for (const row of itemsRaw) {
      if (typeof row === 'object' && row !== null) {
        const r = row as Record<string, unknown>
        const pid = r.producto_id ?? r.product_id
        const qty = r.cantidad ?? r.quantity
        if (pid != null && qty != null) {
          items.push({
            product_id: String(pid),
            quantity: Number(qty),
          })
        }
      }
    }

    const farmerId =
      String(input.caficultor_id ?? input.farmer_id ?? '') || contexto.farmerId

    const out = await createOrderAdmin({
      farmerId,
      warehouseId,
      channel: canal,
      notes: notas,
      items,
    })

    const admin = createAdminClient()
    const { data: wh } = await admin
      .from('warehouses')
      .select('whatsapp_phone, name')
      .eq('id', warehouseId)
      .maybeSingle()

    if (wh?.whatsapp_phone) {
      try {
        await enviarMensajeWhatsApp(
          wh.whatsapp_phone as string,
          `Nuevo pedido ${out.orderNumber} en GranoVivo. Productos: ${items.length} línea(s).`
        )
      } catch {
        /* opcional */
      }
    }

    return {
      name,
      result: {
        order_id: out.orderId,
        order_number: out.orderNumber,
        total: out.total,
        almacen: wh?.name,
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
