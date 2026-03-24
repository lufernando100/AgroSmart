'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { OrderMetadataFarmerWhatsappNotify, OrderStatus } from '@/types/database'

type OrderApiPayload = {
  order: {
    id: string
    order_number: string
    status: OrderStatus
    total: number | string
    subtotal: number | string
    created_at: string
    metadata?: Record<string, unknown> | null
  }
}

function parseFarmerWhatsappNotify(
  meta: unknown
): OrderMetadataFarmerWhatsappNotify | null {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return null
  const raw = (meta as Record<string, unknown>).farmer_whatsapp_notify
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  const status = o.status
  if (status !== 'sent' && status !== 'failed' && status !== 'skipped_no_phone') {
    return null
  }
  const at = o.at
  if (typeof at !== 'string') return null
  return { at, status }
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
  const [whatsappNotify, setWhatsappNotify] = useState<OrderMetadataFarmerWhatsappNotify | null>(
    () => parseFarmerWhatsappNotify(initial.order.metadata)
  )

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
          const row = payload.new as {
            status?: OrderStatus
            total?: number | string
            metadata?: Record<string, unknown> | null
          }
          if (row.status) setStatus(row.status)
          if (row.total != null) setTotal(String(row.total))
          const n = parseFarmerWhatsappNotify(row.metadata)
          if (n) setWhatsappNotify(n)
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [orderId])

  const info = labels[status] ?? { texto: status, color: '#736E64', bg: '#F5F3EF' }

  const showWhatsappFallback =
    (status === 'confirmed' || status === 'rejected') &&
    whatsappNotify &&
    whatsappNotify.status !== 'sent'

  const whatsappFallbackText =
    whatsappNotify?.status === 'skipped_no_phone'
      ? 'No pudimos avisarte por WhatsApp porque faltaba tu celular en el perfil. El estado de arriba es la confirmación oficial en la app.'
      : whatsappNotify?.status === 'failed'
        ? 'No pudimos enviar el aviso por WhatsApp (servicio no disponible o error temporal). El estado de arriba es la confirmación oficial en la app.'
        : null

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
      {status === 'pending' ? (
        <p className="mt-3 text-xs leading-relaxed text-[#736E64]" role="status">
          Cuando el almacén responda, este cuadro se actualiza solo. Si no te llega WhatsApp, podés
          volver aquí o al catálogo para ver el resultado.
        </p>
      ) : null}
      {(status === 'confirmed' || status === 'rejected') && !showWhatsappFallback ? (
        <p className="mt-3 text-xs leading-relaxed text-[#736E64]" role="status">
          {whatsappNotify?.status === 'sent'
            ? 'Si no ves el mensaje en WhatsApp, este estado en la app es la referencia oficial.'
            : 'Este estado en la app es la referencia oficial de tu pedido.'}
        </p>
      ) : null}
      {showWhatsappFallback && whatsappFallbackText ? (
        <div
          className="mt-3 rounded-lg border border-[#E8C9A8] bg-[#FFF9F0] px-3 py-2 text-xs leading-relaxed text-[#5C4A32]"
          role="status"
        >
          {whatsappFallbackText}
        </div>
      ) : null}
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
