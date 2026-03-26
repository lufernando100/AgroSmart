import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPricesQuery = {
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'prices') {
        mockPricesQuery.eq.mockReturnThis()
        mockPricesQuery.order.mockReturnThis()
        mockPricesQuery.limit.mockResolvedValue({ data: [], error: null })
        return {
          select: vi.fn().mockReturnValue(mockPricesQuery),
        }
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: () => ({
          select: () => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'soil-1' }, error: null }),
          }),
        }),
      }
    },
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
  sendWhatsAppMessage: vi.fn().mockResolvedValue({ ok: true }),
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

  describe('interpretar_analisis_suelo', () => {
    it('retorna error cuando no recibe valores numéricos', async () => {
      const result = await ejecutarTool({
        name: 'interpretar_analisis_suelo',
        input: { usuario_id: 'u1', finca_id: 'f1', valores: {} },
        contexto: CONTEXTO,
      })
      expect((result.result as { error: string }).error).toContain('numéricos')
    })

    it('retorna recomendación y análisis_id cuando recibe valores válidos', async () => {
      const result = await ejecutarTool({
        name: 'interpretar_analisis_suelo',
        input: {
          usuario_id: 'u1',
          finca_id: 'f1',
          valores: { ph: 4.9, magnesio: 0.2, azufre: 8 },
        },
        contexto: CONTEXTO,
      })
      const data = result.result as {
        analisis_id: string
        recomendacion: { grade: string }
      }
      expect(data.analisis_id).toBe('soil-1')
      expect(data.recomendacion.grade).toBe('23-4-20-3-4')
    })
  })

  describe('comparar_precios', () => {
    const PRODUCT_UUID = 'dddddddd-0000-4000-8000-000000000001'

    it('retorna error con producto_id inválido (no UUID)', async () => {
      const result = await ejecutarTool({
        name: 'comparar_precios',
        input: { producto_id: 'not-a-uuid', caficultor_id: 'caf-123' },
        contexto: CONTEXTO,
      })
      expect((result.result as { error: string }).error).toMatch(/inválido/i)
    })

    it('retorna lista vacía con mensaje cuando no hay almacenes', async () => {
      mockPricesQuery.limit.mockResolvedValueOnce({ data: [], error: null })

      const result = await ejecutarTool({
        name: 'comparar_precios',
        input: { producto_id: PRODUCT_UUID, caficultor_id: 'caf-123' },
        contexto: CONTEXTO,
      })
      const data = result.result as { almacenes: unknown[]; mensaje: string }
      expect(data.almacenes).toHaveLength(0)
      expect(data.mensaje).toMatch(/disponible/i)
    })

    it('devuelve almacenes ordenados cuando hay resultados', async () => {
      mockPricesQuery.limit.mockResolvedValueOnce({
        data: [
          {
            unit_price: 150000,
            warehouse_id: 'wh-1',
            stock: 50,
            warehouses: { name: 'Almacén Barato', municipality: 'Manizales' },
          },
          {
            unit_price: 180000,
            warehouse_id: 'wh-2',
            stock: 10,
            warehouses: { name: 'Almacén Caro', municipality: 'Pereira' },
          },
        ],
        error: null,
      })

      const result = await ejecutarTool({
        name: 'comparar_precios',
        input: { producto_id: PRODUCT_UUID, caficultor_id: 'caf-123' },
        contexto: CONTEXTO,
      })
      const data = result.result as {
        almacenes: Array<{ name: string; unit_price: number }>
      }
      expect(data.almacenes).toHaveLength(2)
      expect(data.almacenes[0].name).toBe('Almacén Barato')
      expect(data.almacenes[0].unit_price).toBe(150000)
    })

    it('retorna error cuando la BD falla', async () => {
      mockPricesQuery.limit.mockResolvedValueOnce({
        data: null,
        error: { message: 'connection error' },
      })

      const result = await ejecutarTool({
        name: 'comparar_precios',
        input: { producto_id: PRODUCT_UUID, caficultor_id: 'caf-123' },
        contexto: CONTEXTO,
      })
      expect((result.result as { error: string }).error).toMatch(/precios/i)
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
