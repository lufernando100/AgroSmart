/**
 * Tests negativos del service de pedidos.
 * Verifican que los errores de BD se convierten a mensajes amigables
 * y que las validaciones previas al INSERT funcionan correctamente.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const CAFICULTOR_UUID = 'aaaaaaaa-0000-4000-8000-000000000001'

function makeSupabaseMock(overrides: {
  users?: { data: unknown; error: unknown }
  warehouses?: { data: unknown; error: unknown }
  prices?: { data: unknown; error: unknown }
  ordersInsert?: { data: unknown; error: unknown }
  orderItemsInsert?: { data: unknown; error: unknown }
  /** Override `auth.getUser()` (e.g. id mismatch avoids hitting admin sync in tests). */
  authUser?: { id: string; phone: string } | null
}) {
  let callCount = 0

  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    from: vi.fn((table: string) => {
      if (table === 'users') {
        builder.maybeSingle.mockResolvedValueOnce(
          overrides.users ?? { data: { id: 'caf-1' }, error: null }
        )
      } else if (table === 'warehouses') {
        builder.maybeSingle.mockResolvedValueOnce(
          overrides.warehouses ?? {
            data: {
              id: 'alm-1',
              commission_percentage: 3,
              active: true,
              accepts_digital_orders: true,
            },
            error: null,
          }
        )
      } else if (table === 'prices') {
        builder.maybeSingle.mockResolvedValueOnce(
          overrides.prices ?? {
            data: { unit_price: 50000, is_available: true },
            error: null,
          }
        )
      } else if (table === 'orders') {
        callCount++
        if (callCount === 1 && overrides.ordersInsert) {
          builder.single.mockResolvedValueOnce(overrides.ordersInsert)
        } else {
          builder.single.mockResolvedValueOnce({
            data: { id: 'ped-1', order_number: 'GV-00001' },
            error: null,
          })
        }
      } else if (table === 'order_items') {
        builder.insert.mockResolvedValueOnce(overrides.orderItemsInsert ?? { error: null })
      }
      return builder
    }),
  }

  const authUser =
    overrides.authUser === undefined
      ? { id: CAFICULTOR_UUID, phone: '+573001234567' }
      : overrides.authUser

  ;(builder as unknown as { auth: { getUser: ReturnType<typeof vi.fn> } }).auth =
    {
      getUser: vi.fn().mockResolvedValue({
        data: { user: authUser },
      }),
    }

  return builder
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { createOrder } from './service'

const VALID_UUID = '30000000-0000-4000-8000-000000000001'
const ALMACEN_UUID = '20000000-0000-4000-8000-000000000001'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createOrder — casos negativos', () => {
  it('lanza error amigable cuando el caficultor no existe en users', async () => {
    const mock = makeSupabaseMock({
      users: { data: null, error: null },
      authUser: {
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        phone: '+573001234567',
      },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      createOrder({
        farmerId: CAFICULTOR_UUID,
        warehouseId: ALMACEN_UUID,
        channel: 'pwa',
        items: [{ product_id: VALID_UUID, quantity: 1 }],
      })
    ).rejects.toThrow(/perfil no está listo/i)
  })

  it('lanza error cuando el almacén no existe', async () => {
    const mock = makeSupabaseMock({
      warehouses: { data: null, error: null },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      createOrder({
        farmerId: CAFICULTOR_UUID,
        warehouseId: ALMACEN_UUID,
        channel: 'pwa',
        items: [{ product_id: VALID_UUID, quantity: 1 }],
      })
    ).rejects.toThrow(/no está disponible/i)
  })

  it('lanza error cuando el almacén está inactivo', async () => {
    const mock = makeSupabaseMock({
      warehouses: {
        data: {
          id: ALMACEN_UUID,
          active: false,
          accepts_digital_orders: true,
        },
        error: null,
      },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      createOrder({
        farmerId: CAFICULTOR_UUID,
        warehouseId: ALMACEN_UUID,
        channel: 'pwa',
        items: [{ product_id: VALID_UUID, quantity: 1 }],
      })
    ).rejects.toThrow(/no está disponible/i)
  })

  it('lanza error cuando el producto no está disponible en el almacén', async () => {
    const mock = makeSupabaseMock({
      prices: { data: { unit_price: 50000, is_available: false }, error: null },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      createOrder({
        farmerId: CAFICULTOR_UUID,
        warehouseId: ALMACEN_UUID,
        channel: 'pwa',
        items: [{ product_id: VALID_UUID, quantity: 1 }],
      })
    ).rejects.toThrow(/no está disponible/i)
  })

  it('lanza error con lista de ítems vacía', async () => {
    const mock = makeSupabaseMock({})
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      createOrder({
        farmerId: CAFICULTOR_UUID,
        warehouseId: ALMACEN_UUID,
        channel: 'pwa',
        items: [],
      })
    ).rejects.toThrow(/al menos un producto/i)
  })

  it('convierte FK violation de la BD en mensaje amigable (farmer_id)', async () => {
    const mock = makeSupabaseMock({
      ordersInsert: {
        data: null,
        error: {
          code: '23503',
          message: 'violates foreign key constraint "orders_farmer_id_fkey"',
        },
      },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      createOrder({
        farmerId: CAFICULTOR_UUID,
        warehouseId: ALMACEN_UUID,
        channel: 'pwa',
        items: [{ product_id: VALID_UUID, quantity: 1 }],
      })
    ).rejects.toThrow(/perfil no está listo/i)
  })

  it('convierte FK violation de la BD en mensaje amigable (warehouse_id)', async () => {
    const mock = makeSupabaseMock({
      ordersInsert: {
        data: null,
        error: {
          code: '23503',
          message: 'violates foreign key constraint "orders_warehouse_id_fkey"',
        },
      },
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(
      createOrder({
        farmerId: CAFICULTOR_UUID,
        warehouseId: ALMACEN_UUID,
        channel: 'pwa',
        items: [{ product_id: VALID_UUID, quantity: 1 }],
      })
    ).rejects.toThrow(/almacén.*no está disponible|disponible/i)
  })
})
