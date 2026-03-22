'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { OrderStatus } from '@/types/database'

type OrderApiPayload = {
  order: {
    id: string
    order_number: string
    status: OrderStatus
    total: number | string
    subtotal: number | string
    created_at: string
  }
}

type Props = {
  orderId: string
  initial: OrderApiPayload
}

const labels: Record<OrderStatus, { texto: string; color: string; bg: string }> = {
  pending: { texto: 'Pendiente de confirmación', color: '#8B6914', bg: '#FAF6F1' },
  confirmed: { texto: 'Confirmado por el almacén', color: '#2D7A2D', bg: '#F0F7F0' },
  rejected: { texto: 'Rechazado por el almacén', color: '#C23B22', bg: '#FDF2F0' },
  delivered: { texto: 'Entregado', color: '#2D7A2D', bg: '#F0F7F0' },
  cancelled: { texto: 'Cancelado', color: '#736E64', bg: '#F5F3EF' },
}

export function PedidoEstadoRealtime({ orderId, initial }: Props) {
  const [status, setStatus] = useState<OrderStatus>(initial.order.status)
  const [total, setTotal] = useState(String(initial.order.total))

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const row = payload.new as { status?: OrderStatus; total?: number | string }
          if (row.status) setStatus(row.status)
          if (row.total != null) setTotal(String(row.total))
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [orderId])

  const info = labels[status] ?? { texto: status, color: '#736E64', bg: '#F5F3EF' }

  return (
    <div
      className="mt-4 rounded-xl border p-4"
      style={{ borderColor: info.color + '33', backgroundColor: info.bg }}
    >
      <p className="text-xs font-medium text-[#736E64]">Estado del pedido</p>
      <p
        className="mt-0.5 text-base font-semibold"
        style={{ color: info.color }}
      >
        {info.texto}
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-[#E8E4DD] pt-3">
        <span className="text-sm text-[#736E64]">Total</span>
        <span
          className="tabular-nums text-lg font-bold"
          style={{ color: info.color }}
        >
          {Number(total).toLocaleString('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
          })}
        </span>
      </div>
    </div>
  )
}
