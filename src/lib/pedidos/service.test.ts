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
import { createOrder, getOrderForUser } from './service'

const VALID_UUID = '30000000-0000-4000-8000-000000000001'
const ALMACEN_UUID = '20000000-0000-4000-8000-000000000001'
const ORDER_UUID = 'bbbbbbbb-0000-4000-8000-000000000001'

function orderRowForFarmer() {
  return {
    id: ORDER_UUID,
    order_number: 'GV-00099',
    status: 'pending',
    channel: 'pwa',
    subtotal: 45000,
    commission: 0,
    total: 45000,
    farmer_id: CAFICULTOR_UUID,
    warehouse_id: ALMACEN_UUID,
    created_at: '2026-03-24T12:00:00Z',
    warehouses: { name: 'Almacen Test', municipality: 'Pitalito', whatsapp_phone: '573001234567' },
  }
}

/**
 * Mocks Supabase for getOrderForUser: two reads on `orders` when metadata column is missing.
 */
function makeGetOrderSupabaseMock(opts: {
  firstOrdersError: { message: string } | null
  secondOrdersData: unknown
  items?: unknown[]
}) {
  let ordersFromCount = 0
  const items = opts.items ?? []

  return {
    from: vi.fn((table: string) => {
      if (table === 'orders') {
        ordersFromCount += 1
        const call = ordersFromCount
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn(async () => {
            if (call === 1 && opts.firstOrdersError) {
              return { data: null, error: opts.firstOrdersError }
            }
            if (call === 1 && !opts.firstOrdersError) {
              return { data: opts.secondOrdersData, error: null }
            }
            return { data: opts.secondOrdersData, error: null }
          }),
        }
      }
      if (table === 'order_items') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ data: items, error: null }),
        }
      }
      throw new Error(`unexpected table: ${table}`)
    }),
  }
}

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

describe('getOrderForUser — orders.metadata migration', () => {
  it('retries without metadata when the column is missing (prod sin 11_orders_metadata.sql)', async () => {
    const row = orderRowForFarmer()
    const mock = makeGetOrderSupabaseMock({
      firstOrdersError: { message: 'column orders.metadata does not exist' },
      secondOrdersData: row,
      items: [],
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    const data = await getOrderForUser(ORDER_UUID, CAFICULTOR_UUID, 'farmer')

    expect(data).not.toBeNull()
    expect(data?.order).toMatchObject({
      id: ORDER_UUID,
      order_number: 'GV-00099',
      farmer_id: CAFICULTOR_UUID,
    })
    expect(mock.from).toHaveBeenCalledWith('orders')
    expect(mock.from).toHaveBeenCalledWith('order_items')
    expect(mock.from.mock.calls.filter((c) => c[0] === 'orders').length).toBe(2)
  })

  it('succeeds on first query when metadata column exists', async () => {
    const row = { ...orderRowForFarmer(), metadata: { farmer_whatsapp_notify: { status: 'sent' } } }
    const mock = makeGetOrderSupabaseMock({
      firstOrdersError: null,
      secondOrdersData: row,
      items: [],
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    const data = await getOrderForUser(ORDER_UUID, CAFICULTOR_UUID, 'farmer')

    expect(data?.order).toMatchObject({ metadata: { farmer_whatsapp_notify: { status: 'sent' } } })
    expect(mock.from.mock.calls.filter((c) => c[0] === 'orders').length).toBe(1)
  })

  it('throws when the first error is not a missing-metadata column', async () => {
    const mock = makeGetOrderSupabaseMock({
      firstOrdersError: { message: 'permission denied for table orders' },
      secondOrdersData: orderRowForFarmer(),
    })
    vi.mocked(createClient).mockResolvedValue(mock as never)

    await expect(getOrderForUser(ORDER_UUID, CAFICULTOR_UUID, 'farmer')).rejects.toThrow(
      /permission denied/i
    )
  })
})
