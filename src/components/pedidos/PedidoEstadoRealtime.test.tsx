import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock Supabase client
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
  pedido: {
    id: 'ped-1',
    numero: 'GV-00042',
    estado: 'pendiente' as const,
    total: 168000,
    subtotal: 168000,
    created_at: '2026-03-21T10:00:00Z',
  },
}

describe('PedidoEstadoRealtime', () => {
  it('muestra el estado inicial', () => {
    render(<PedidoEstadoRealtime pedidoId="ped-1" initial={INITIAL} />)
    expect(screen.getByText('Pendiente de confirmación')).toBeInTheDocument()
  })

  it('muestra el total formateado', () => {
    render(<PedidoEstadoRealtime pedidoId="ped-1" initial={INITIAL} />)
    // El total se formatea como COP
    const totalEl = screen.getByText(/168/i)
    expect(totalEl).toBeInTheDocument()
  })

  it('muestra label para estado confirmado', () => {
    const confirmado = {
      pedido: {
        ...INITIAL.pedido,
        estado: 'confirmado' as const,
      },
    }
    render(<PedidoEstadoRealtime pedidoId="ped-1" initial={confirmado} />)
    expect(screen.getByText('Confirmado por el almacén')).toBeInTheDocument()
  })

  it('muestra label para estado rechazado', () => {
    const rechazado = {
      pedido: {
        ...INITIAL.pedido,
        estado: 'rechazado' as const,
      },
    }
    render(<PedidoEstadoRealtime pedidoId="ped-1" initial={rechazado} />)
    expect(screen.getByText('Rechazado por el almacén')).toBeInTheDocument()
  })


  it('muestra label para estado entregado', () => {
    const entregado = {
      pedido: {
        ...INITIAL.pedido,
        estado: 'entregado' as const,
      },
    }
    render(<PedidoEstadoRealtime pedidoId="ped-1" initial={entregado} />)
    expect(screen.getByText('Entregado')).toBeInTheDocument()
  })

  it('muestra label para estado cancelado', () => {
    const cancelado = {
      pedido: {
        ...INITIAL.pedido,
        estado: 'cancelado' as const,
      },
    }
    render(<PedidoEstadoRealtime pedidoId="ped-1" initial={cancelado} />)
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })
})
