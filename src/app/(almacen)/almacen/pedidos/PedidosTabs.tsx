'use client'

import { useMemo, useState } from 'react'
import type { PedidoAlmacenLista } from '@/lib/pedidos/service'
import type { PedidoEstado } from '@/types/database'

type Fila = PedidoAlmacenLista

type Tab = PedidoEstado | 'todos'

const tabs: { key: Tab; label: string }[] = [
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'confirmado', label: 'Confirmados' },
  { key: 'entregado', label: 'Entregados' },
  { key: 'rechazado', label: 'Rechazados' },
  { key: 'todos', label: 'Todos' },
]

export function PedidosTabs({ pedidos }: { pedidos: Fila[] }) {
  const [tab, setTab] = useState<Tab>('pendiente')
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    if (tab === 'todos') return pedidos
    return pedidos.filter((p) => p.estado === tab)
  }, [pedidos, tab])

  async function patch(
    pedidoId: string,
    accion: 'confirmar' | 'rechazar' | 'entregar',
    extra?: { notas_almacen?: string; precio_confirmado_almacen?: number }
  ) {
    setError(null)
    setActionId(pedidoId)
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion, ...extra }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'No se pudo actualizar.')
        return
      }
      window.location.reload()
    } finally {
      setActionId(null)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              tab === t.key
                ? 'bg-emerald-700 text-white'
                : 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      <ul className="mt-6 flex flex-col gap-3">
        {filtrados.length === 0 ? (
          <li className="text-zinc-600 dark:text-zinc-400">No hay pedidos en esta pestaña.</li>
        ) : null}
        {filtrados.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono font-semibold text-zinc-900 dark:text-zinc-50">
                  {p.numero}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {p.usuarios?.nombre ?? 'Caficultor'}{' '}
                  {p.usuarios?.telefono ? `· ${p.usuarios.telefono}` : ''}
                </p>
                <p className="text-sm text-zinc-500">
                  {new Date(p.created_at).toLocaleString('es-CO')}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Estado:</span>{' '}
                  {p.estado}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">Total:</span>{' '}
                  {Number(p.total).toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {p.estado === 'pendiente' ? (
                  <>
                    <button
                      type="button"
                      disabled={actionId === p.id}
                      onClick={() => void patch(p.id, 'confirmar')}
                      className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      disabled={actionId === p.id}
                      onClick={() => {
                        const motivo = window.prompt('Motivo del rechazo (obligatorio):')
                        if (motivo === null) return
                        if (!motivo.trim()) {
                          setError('Escribe un motivo.')
                          return
                        }
                        void patch(p.id, 'rechazar', { notas_almacen: motivo.trim() })
                      }}
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Rechazar
                    </button>
                  </>
                ) : null}
                {p.estado === 'confirmado' ? (
                  <button
                    type="button"
                    disabled={actionId === p.id}
                    onClick={() => void patch(p.id, 'entregar')}
                    className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-50 dark:bg-zinc-700"
                  >
                    Marcar entregado
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
