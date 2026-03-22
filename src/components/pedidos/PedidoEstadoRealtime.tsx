'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PedidoEstado } from '@/types/database'

type PedidoApi = {
  pedido: {
    id: string
    numero: string
    estado: PedidoEstado
    total: number | string
    subtotal: number | string
    created_at: string
  }
}

type Props = {
  pedidoId: string
  initial: PedidoApi
}

const labels: Record<PedidoEstado, { texto: string; color: string; bg: string }> = {
  pendiente:  { texto: 'Pendiente de confirmación', color: '#8B6914', bg: '#FAF6F1' },
  confirmado: { texto: 'Confirmado por el almacén', color: '#2D7A2D', bg: '#F0F7F0' },
  rechazado:  { texto: 'Rechazado por el almacén',  color: '#C23B22', bg: '#FDF2F0' },
  entregado:  { texto: 'Entregado',                 color: '#2D7A2D', bg: '#F0F7F0' },
  cancelado:  { texto: 'Cancelado',                 color: '#736E64', bg: '#F5F3EF' },
}

export function PedidoEstadoRealtime({ pedidoId, initial }: Props) {
  const [estado, setEstado] = useState<PedidoEstado>(initial.pedido.estado)
  const [total, setTotal] = useState(String(initial.pedido.total))

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`pedido-${pedidoId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pedidos',
          filter: `id=eq.${pedidoId}`,
        },
        (payload) => {
          const row = payload.new as { estado?: PedidoEstado; total?: number | string }
          if (row.estado) setEstado(row.estado)
          if (row.total != null) setTotal(String(row.total))
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [pedidoId])

  const info = labels[estado] ?? { texto: estado, color: '#736E64', bg: '#F5F3EF' }

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
