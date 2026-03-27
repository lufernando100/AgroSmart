import { searchProductsTextOnly } from '@/lib/catalogo/queries'
import type { ToolContext } from './registry'

export async function buscarProductos(
  input: Record<string, unknown>,
  contexto: ToolContext
): Promise<unknown> {
  void contexto
  const termino = String(input.termino_busqueda ?? '')
  if (!termino.trim()) {
    return { error: 'termino_busqueda vacío' }
  }
  const data = await searchProductsTextOnly({ search: termino, sector: 'coffee' })
  return { productos: data.slice(0, 15) }
}
