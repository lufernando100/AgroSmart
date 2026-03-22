/**
 * Tests negativos del service de pedidos.
 * Verifican que los errores de BD se convierten a mensajes amigables
 * y que las validaciones previas al INSERT funcionan correctamente.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

/** Encadenamiento fluido de Supabase: .from().select().eq()...maybeSingle() / .single() / .insert() */
function makeSupabaseMock(overrides: {
  usuarios?: { data: unknown; error: unknown }
  almacenes?: { data: unknown; error: unknown }
  precios?: { data: unknown; error: unknown }
  pedidosInsert?: { data: unknown; error: unknown }
  pedidoItemsInsert?: { data: unknown; error: unknown }
}) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }

  let callCount = 0

  builder.from = vi.fn((table: string) => {
    if (table === 'usuarios') {
      builder.maybeSingle.mockResolvedValueOnce(overrides.usuarios ?? { data: { id: 'caf-1' }, error: null })
    } else if (table === 'almacenes') {
      builder.maybeSingle.mockResolvedValueOnce(
        overrides.almacenes ?? {
          data: { id: 'alm-1', comision_porcentaje: 3, activo: true, acepta_pedidos_digitales: true },
          error: null,
        }
      )
    } else if (table === 'precios') {
      builder.maybeSingle.mockResolvedValueOnce(
        overrides.precios ?? {
          data: { precio_unitario: 50000, disponible: true },
          error: null,
        }
      )
    } else if (table === 'pedidos') {
      callCount++
      if (callCount === 1 && overrides.pedidosInsert) {
        // primera llamada al INSERT de pedidos
        builder.single.mockResolvedValueOnce(overrides.pedidosInsert)
      } else {
        builder.single.mockResolvedValueOnce({ data: { id: 'ped-1', numero: 'GV-00001' }, error: null })
      }
    } else if (table === 'pedido_items') {
      builder.insert.mockResolvedValueOnce(overrides.pedidoItemsInsert ?? { error: null })
    }
    return builder
  })

  return builder
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { crearPedido } from './service'

const VALID_UUID = '30000000-0000-4000-8000-000000000001'
const ALMACEN_UUID = '20000000-0000-4000-8000-000000000001'
const CAFICULTOR_UUID = 'aaaaaaaa-0000-4000-8000-000000000001'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('crearPedido — casos negativos', () => {
  it('lanza error amigable cuando el caficultor no existe en usuarios', async () => {
    const mock = makeSupabaseMock({
      usuarios: { data: null, error: null }, // no existe en public.usuarios
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      crearPedido({
        caficultorId: CAFICULTOR_UUID,
        almacenId: ALMACEN_UUID,
        canal: 'pwa',
        items: [{ producto_id: VALID_UUID, cantidad: 1 }],
      })
    ).rejects.toThrow(/perfil no está listo/i)
  })

  it('lanza error cuando el almacén no existe', async () => {
    const mock = makeSupabaseMock({
      almacenes: { data: null, error: null }, // almacén no encontrado
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      crearPedido({
        caficultorId: CAFICULTOR_UUID,
        almacenId: ALMACEN_UUID,
        canal: 'pwa',
        items: [{ producto_id: VALID_UUID, cantidad: 1 }],
      })
    ).rejects.toThrow(/no está disponible/i)
  })

  it('lanza error cuando el almacén está inactivo', async () => {
    const mock = makeSupabaseMock({
      almacenes: {
        data: { id: ALMACEN_UUID, activo: false, acepta_pedidos_digitales: true },
        error: null,
      },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      crearPedido({
        caficultorId: CAFICULTOR_UUID,
        almacenId: ALMACEN_UUID,
        canal: 'pwa',
        items: [{ producto_id: VALID_UUID, cantidad: 1 }],
      })
    ).rejects.toThrow(/no está disponible/i)
  })

  it('lanza error cuando el producto no está disponible en el almacén', async () => {
    const mock = makeSupabaseMock({
      precios: { data: { precio_unitario: 50000, disponible: false }, error: null },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      crearPedido({
        caficultorId: CAFICULTOR_UUID,
        almacenId: ALMACEN_UUID,
        canal: 'pwa',
        items: [{ producto_id: VALID_UUID, cantidad: 1 }],
      })
    ).rejects.toThrow(/no está disponible/i)
  })

  it('lanza error con lista de ítems vacía', async () => {
    const mock = makeSupabaseMock({})
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      crearPedido({
        caficultorId: CAFICULTOR_UUID,
        almacenId: ALMACEN_UUID,
        canal: 'pwa',
        items: [], // vacío
      })
    ).rejects.toThrow(/al menos un producto/i)
  })

  it('convierte FK violation de la BD en mensaje amigable (caficultor_id)', async () => {
    const mock = makeSupabaseMock({
      pedidosInsert: {
        data: null,
        error: {
          code: '23503',
          message: 'violates foreign key constraint "pedidos_caficultor_id_fkey"',
        },
      },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      crearPedido({
        caficultorId: CAFICULTOR_UUID,
        almacenId: ALMACEN_UUID,
        canal: 'pwa',
        items: [{ producto_id: VALID_UUID, cantidad: 1 }],
      })
    ).rejects.toThrow(/perfil no está listo/i)
  })

  it('convierte FK violation de la BD en mensaje amigable (almacen_id)', async () => {
    const mock = makeSupabaseMock({
      pedidosInsert: {
        data: null,
        error: {
          code: '23503',
          message: 'violates foreign key constraint "pedidos_almacen_id_fkey"',
        },
      },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      crearPedido({
        caficultorId: CAFICULTOR_UUID,
        almacenId: ALMACEN_UUID,
        canal: 'pwa',
        items: [{ producto_id: VALID_UUID, cantidad: 1 }],
      })
    ).rejects.toThrow(/almacén.*no está disponible|disponible/i)
  })
})
