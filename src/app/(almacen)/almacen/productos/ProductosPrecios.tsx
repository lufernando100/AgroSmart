'use client'

import { useState } from 'react'
import type { WarehousePriceRow } from '@/lib/almacen/precios'

export function ProductosPrecios({ initial }: { initial: WarehousePriceRow[] }) {
  const [filas, setFilas] = useState(initial)
  const [editing, setEditing] = useState<string | null>(null)
  const [precioDraft, setPrecioDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function guardarPrecio(priceId: string) {
    const digits = precioDraft.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
    const n = Number(digits)
    if (!Number.isFinite(n) || n < 0) {
      setError('Precio inválido.')
      return
    }
    setError(null)
    setLoadingId(priceId)
    try {
      const res = await fetch(`/api/almacen/precios/${priceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unit_price: n }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'No se pudo guardar.')
        return
      }
      setFilas((rows) =>
        rows.map((r) => (r.price_id === priceId ? { ...r, unit_price: n } : r))
      )
      setEditing(null)
    } finally {
      setLoadingId(null)
    }
  }

  async function toggleDisponible(priceId: string, is_available: boolean) {
    setError(null)
    setLoadingId(priceId)
    try {
      const res = await fetch(`/api/almacen/precios/${priceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !is_available }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'No se pudo actualizar.')
        return
      }
      setFilas((rows) =>
        rows.map((r) =>
          r.price_id === priceId ? { ...r, is_available: !is_available } : r
        )
      )
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <ul className="flex flex-col gap-3">
        {filas.length === 0 ? (
          <li className="text-zinc-600 dark:text-zinc-400">No hay precios cargados.</li>
        ) : null}
        {filas.map((r) => (
          <li
            key={r.price_id}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">{r.name}</p>
                {r.presentation ? (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{r.presentation}</p>
                ) : null}
                <p className="text-xs text-zinc-500">{r.unit_of_measure}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {editing === r.price_id ? (
                  <>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={precioDraft}
                      onChange={(e) => setPrecioDraft(e.target.value)}
                      className="w-36 rounded border border-zinc-300 px-2 py-1 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
                      placeholder="COP"
                    />
                    <button
                      type="button"
                      disabled={loadingId === r.price_id}
                      onClick={() => void guardarPrecio(r.price_id)}
                      className="rounded-lg bg-emerald-700 px-3 py-1 text-sm text-white"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="text-sm text-zinc-600 underline"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                      {r.unit_price.toLocaleString('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(r.price_id)
                        setPrecioDraft(String(Math.round(r.unit_price)))
                      }}
                      className="text-sm font-medium text-emerald-800 underline dark:text-emerald-400"
                    >
                      Editar
                    </button>
                  </>
                )}
                <button
                  type="button"
                  disabled={loadingId === r.price_id}
                  onClick={() => void toggleDisponible(r.price_id, r.is_available)}
                  className={`rounded-lg px-3 py-1 text-sm font-medium ${
                    r.is_available
                      ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                  }`}
                >
                  {r.is_available ? 'Disponible' : 'Agotado'}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
