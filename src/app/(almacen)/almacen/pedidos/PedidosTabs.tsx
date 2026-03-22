'use client'

import { useMemo, useState } from 'react'
import { MensajeError } from '@/components/ui/MensajeError'
import { MensajeVacio } from '@/components/ui/MensajeVacio'
import { ClipboardList } from 'lucide-react'
import { formatCOP, formatFecha } from '@/lib/utils/format'
import type { WarehouseOrderRow } from '@/lib/pedidos/service'
import type { OrderStatus } from '@/types/database'

type Tab = OrderStatus | 'todos'

const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'delivered', label: 'Entregados' },
  { key: 'rejected', label: 'Rechazados' },
  { key: 'todos', label: 'Todos' },
]

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  rejected: 'Rechazado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-[#FDF6EC] text-[#8B6914]',
  confirmed: 'bg-[#F0F7F0] text-[#2D7A2D]',
  delivered: 'bg-[#F5F3EF] text-[#524E46]',
  rejected: 'bg-[#FEF2F2] text-[#C23B22]',
  cancelled: 'bg-[#F5F3EF] text-[#A39E94]',
}

export function PedidosTabs({ pedidos }: { pedidos: WarehouseOrderRow[] }) {
  const [tab, setTab] = useState<Tab>('pending')
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    if (tab === 'todos') return pedidos
    return pedidos.filter((p) => p.status === tab)
  }, [pedidos, tab])

  async function patch(
    orderId: string,
    action: 'confirm' | 'reject' | 'deliver',
    extra?: { warehouse_notes?: string }
  ) {
    setError(null)
    setActionId(orderId)
    try {
      const res = await fetch(`/api/pedidos/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, ...extra }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'No se pudo actualizar el pedido.')
        return
      }
      window.location.reload()
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8E4DD] pb-3">
        {TABS.map((t) => {
          const count = t.key === 'todos' ? pedidos.length : pedidos.filter((p) => p.status === t.key).length
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all active:scale-95 ${
                tab === t.key
                  ? 'bg-[#2D7A2D] text-white shadow-sm'
                  : 'bg-white border border-[#E8E4DD] text-[#524E46] hover:border-[#2D7A2D]/40'
              }`}
            >
              {t.label}
              {count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    tab === t.key ? 'bg-white/25 text-white' : 'bg-[#F5F3EF] text-[#736E64]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {error ? (
        <div className="mt-4">
          <MensajeError message={error} onRetry={() => setError(null)} />
        </div>
      ) : null}

      <ul className="mt-4 flex flex-col gap-3">
        {filtrados.length === 0 ? (
          <MensajeVacio
            Icon={ClipboardList}
            title="Sin pedidos aquí"
            description="Cuando lleguen pedidos en esta categoría aparecerán acá."
          />
        ) : null}

        {filtrados.map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-mono font-bold text-[#252320]">{p.order_number}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-[#3A3732]">
                  {p.users?.name ?? 'Caficultor'}
                  {p.users?.phone ? (
                    <span className="ml-1 font-normal text-[#736E64]">· {p.users.phone}</span>
                  ) : null}
                </p>
                <p className="text-xs text-[#A39E94]">{formatFecha(p.created_at)}</p>
                <p className="mt-2 tabular-nums text-lg font-bold text-[#2D7A2D]">
                  {formatCOP(Number(p.total))}
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                {p.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      disabled={actionId === p.id}
                      onClick={() => void patch(p.id, 'confirm')}
                      className="h-10 rounded-xl bg-[#2D7A2D] px-4 text-sm font-semibold text-white hover:bg-[#236023] disabled:opacity-50 active:scale-[0.97] transition-all"
                    >
                      {actionId === p.id ? 'Confirmando…' : 'Confirmar'}
                    </button>
                    <button
                      type="button"
                      disabled={actionId === p.id}
                      onClick={() => {
                        const motivo = window.prompt('Motivo del rechazo (obligatorio):')
                        if (motivo === null) return
                        if (!motivo.trim()) { setError('Escribe un motivo para el rechazo.'); return }
                        void patch(p.id, 'reject', { warehouse_notes: motivo.trim() })
                      }}
                      className="h-10 rounded-xl border border-[#C23B22]/40 px-4 text-sm font-semibold text-[#C23B22] hover:bg-[#FEF2F2] disabled:opacity-50 active:scale-[0.97] transition-all"
                    >
                      Rechazar
                    </button>
                  </>
                ) : null}
                {p.status === 'confirmed' ? (
                  <button
                    type="button"
                    disabled={actionId === p.id}
                    onClick={() => void patch(p.id, 'deliver')}
                    className="h-10 rounded-xl border border-[#D4CEC4] bg-[#F5F3EF] px-4 text-sm font-semibold text-[#3A3732] hover:bg-[#E8E4DD] disabled:opacity-50 active:scale-[0.97] transition-all"
                  >
                    {actionId === p.id ? 'Guardando…' : 'Marcar entregado'}
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
