import type { Channel } from '@/types/database'
import { buscarProductos } from './buscar-productos'
import { compararPrecios } from './comparar-precios'
import { crearPedido } from './crear-pedido'
import { notificarAlmacen } from './notificar-almacen'
import { interpretarAnalisisSuelo } from './interpretar-suelo'

export type ToolContext = {
  farmerId: string
  channel: Channel
}

export type ToolHandler = (
  input: Record<string, unknown>,
  contexto: ToolContext
) => Promise<unknown>

export const toolRegistry: Record<string, ToolHandler> = {
  buscar_productos: buscarProductos,
  comparar_precios: compararPrecios,
  crear_pedido: crearPedido,
  notificar_almacen: notificarAlmacen,
  interpretar_analisis_suelo: interpretarAnalisisSuelo,
}
