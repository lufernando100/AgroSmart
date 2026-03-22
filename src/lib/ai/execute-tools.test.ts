import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/pedidos/service', () => ({
  createOrderAdmin: vi.fn().mockResolvedValue({
    orderId: 'ped-1',
    orderNumber: 'GV-00001',
    subtotal: 168000,
    total: 168000,
  }),
}))

vi.mock('@/lib/catalogo/queries', () => ({
  searchProductsTextOnly: vi.fn().mockResolvedValue([
    { id: 'p1', name: 'Fertilizante 25-4-24', price_from: 168000 },
  ]),
}))

vi.mock('@/lib/whatsapp/send', () => ({
  enviarMensajeWhatsApp: vi.fn().mockResolvedValue({ ok: true }),
}))

import { ejecutarTool } from './execute-tools'
import { searchProductsTextOnly } from '@/lib/catalogo/queries'

const CONTEXTO = {
  farmerId: 'caf-uuid-123',
  channel: 'whatsapp' as const,
}

describe('ejecutarTool', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('buscar_productos', () => {
    it('busca productos por término', async () => {
      const result = await ejecutarTool({
        name: 'buscar_productos',
        input: { termino_busqueda: 'fertilizante' },
        contexto: CONTEXTO,
      })
      expect(result.name).toBe('buscar_productos')
      expect(searchProductsTextOnly).toHaveBeenCalledWith({
        search: 'fertilizante',
        sector: 'coffee',
      })
      const data = result.result as { productos: unknown[] }
      expect(data.productos).toHaveLength(1)
    })

    it('retorna error con término vacío', async () => {
      const result = await ejecutarTool({
        name: 'buscar_productos',
        input: { termino_busqueda: '' },
        contexto: CONTEXTO,
      })
      expect((result.result as { error: string }).error).toContain('vacío')
    })

    it('retorna error sin termino_busqueda', async () => {
      const result = await ejecutarTool({
        name: 'buscar_productos',
        input: {},
        contexto: CONTEXTO,
      })
      expect((result.result as { error: string }).error).toContain('vacío')
    })

    it('limita resultados a 15', async () => {
      const muchos = Array.from({ length: 20 }, (_, i) => ({
        id: `p${i}`,
        name: `Producto ${i}`,
      }))
      vi.mocked(searchProductsTextOnly).mockResolvedValueOnce(muchos as never)

      const result = await ejecutarTool({
        name: 'buscar_productos',
        input: { termino_busqueda: 'test' },
        contexto: CONTEXTO,
      })
      const data = result.result as { productos: unknown[] }
      expect(data.productos).toHaveLength(15)
    })
  })

  describe('crear_pedido', () => {
    it('retorna error con items no array', async () => {
      const result = await ejecutarTool({
        name: 'crear_pedido',
        input: { almacen_id: 'alm-1', items: 'no array' },
        contexto: CONTEXTO,
      })
      expect((result.result as { error: string }).error).toContain('items inválidos')
    })
  })

  describe('notificar_almacen', () => {
    it('retorna error sin teléfono', async () => {
      const result = await ejecutarTool({
        name: 'notificar_almacen',
        input: { mensaje: 'Hola' },
        contexto: CONTEXTO,
      })
      expect((result.result as { error: string }).error).toContain('faltante')
    })

    it('retorna error sin mensaje', async () => {
      const result = await ejecutarTool({
        name: 'notificar_almacen',
        input: { telefono_whatsapp: '3001234567' },
        contexto: CONTEXTO,
      })
      expect((result.result as { error: string }).error).toContain('faltante')
    })
  })

  describe('tool desconocida', () => {
    it('retorna error para tool que no existe', async () => {
      const result = await ejecutarTool({
        name: 'tool_inexistente',
        input: {},
        contexto: CONTEXTO,
      })
      expect((result.result as { error: string }).error).toContain('desconocida')
    })
  })
})
