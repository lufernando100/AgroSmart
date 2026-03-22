import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    channel: () => ({
      on: function () {
        return this
      },
      subscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  }),
}))

import { PedidoEstadoRealtime } from './PedidoEstadoRealtime'

const INITIAL = {
  order: {
    id: 'ped-1',
    order_number: 'GV-00042',
    status: 'pending' as const,
    total: 168000,
    subtotal: 168000,
    created_at: '2026-03-21T10:00:00Z',
  },
}

describe('PedidoEstadoRealtime', () => {
  it('muestra el estado inicial', () => {
    render(<PedidoEstadoRealtime orderId="ped-1" initial={INITIAL} />)
    expect(screen.getByText('Pendiente de confirmación')).toBeInTheDocument()
  })

  it('muestra el total formateado', () => {
    render(<PedidoEstadoRealtime orderId="ped-1" initial={INITIAL} />)
    const totalEl = screen.getByText(/168/i)
    expect(totalEl).toBeInTheDocument()
  })

  it('muestra label para estado confirmado', () => {
    const confirmado = {
      order: {
        ...INITIAL.order,
        status: 'confirmed' as const,
      },
    }
    render(<PedidoEstadoRealtime orderId="ped-1" initial={confirmado} />)
    expect(screen.getByText('Confirmado por el almacén')).toBeInTheDocument()
  })

  it('muestra label para estado rechazado', () => {
    const rechazado = {
      order: {
        ...INITIAL.order,
        status: 'rejected' as const,
      },
    }
    render(<PedidoEstadoRealtime orderId="ped-1" initial={rechazado} />)
    expect(screen.getByText('Rechazado por el almacén')).toBeInTheDocument()
  })

  it('muestra label para estado entregado', () => {
    const entregado = {
      order: {
        ...INITIAL.order,
        status: 'delivered' as const,
      },
    }
    render(<PedidoEstadoRealtime orderId="ped-1" initial={entregado} />)
    expect(screen.getByText('Entregado')).toBeInTheDocument()
  })

  it('muestra label para estado cancelado', () => {
    const cancelado = {
      order: {
        ...INITIAL.order,
        status: 'cancelled' as const,
      },
    }
    render(<PedidoEstadoRealtime orderId="ped-1" initial={cancelado} />)
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })
})
