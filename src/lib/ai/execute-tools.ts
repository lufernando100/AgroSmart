import { createAdminClient } from '@/lib/supabase/admin'
import { createOrderAdmin } from '@/lib/pedidos/service'
import { buildNewOrderWhatsAppMessage } from '@/lib/pedidos/whatsapp-order-summary'
import { searchProductsTextOnly } from '@/lib/catalogo/queries'
import { sendWhatsAppMessage } from '@/lib/whatsapp/send'
import type { Channel } from '@/types/database'
import {
  buildSoilInterpretation,
  buildSoilRecommendation,
  buildSoilRecommendationText,
  type SoilInputValues,
} from '@/lib/suelo/interpretation'

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
        const detailed = await buildNewOrderWhatsAppMessage(admin, out.orderId)
        await sendWhatsAppMessage(
          wh.whatsapp_phone as string,
          detailed ??
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
    const r = await sendWhatsAppMessage(telefono, mensaje)
    return { name, result: r }
  }

  if (name === 'interpretar_analisis_suelo') {
    const userId = String(input.usuario_id ?? contexto.farmerId)
    const farmId = String(input.finca_id ?? '')
    const plotId = input.lote_id != null ? String(input.lote_id) : undefined
    const valores = (input.valores ?? {}) as SoilInputValues

    const interpretation = buildSoilInterpretation(valores)
    if (interpretation.length === 0) {
      return {
        name,
        result: { error: 'No se encontraron valores numéricos para interpretar.' },
      }
    }

    const recommendation = buildSoilRecommendation(valores)
    const recommendationText = buildSoilRecommendationText(recommendation)

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('soil_analysis')
      .insert({
        user_id: userId,
        farm_id: farmId || null,
        plot_id: plotId ?? null,
        input_channel: contexto.channel,
        ph: valores.ph ?? null,
        organic_matter: valores.materia_organica ?? null,
        phosphorus: valores.fosforo ?? null,
        potassium: valores.potasio ?? null,
        calcium: valores.calcio ?? null,
        magnesium: valores.magnesio ?? null,
        aluminum: valores.aluminio ?? null,
        sulfur: valores.azufre ?? null,
        iron: valores.hierro ?? null,
        copper: valores.cobre ?? null,
        manganese: valores.manganeso ?? null,
        zinc: valores.zinc ?? null,
        boron: valores.boro ?? null,
        cec: valores.cice ?? null,
        interpretation,
        recommendation,
        recommendation_text: recommendationText,
      })
      .select('id')
      .maybeSingle()

    if (error) {
      return { name, result: { error: 'No fue posible guardar el análisis de suelo.' } }
    }

    return {
      name,
      result: {
        analisis_id: data?.id,
        interpretacion: interpretation,
        recomendacion: recommendation,
        recomendacion_texto: recommendationText,
      },
    }
  }

  return { name, result: { error: `Tool desconocida: ${name}` } }
}
