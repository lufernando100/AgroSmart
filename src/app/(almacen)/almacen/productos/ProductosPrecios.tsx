'use client'

import { useState } from 'react'
import { MensajeError } from '@/components/ui/MensajeError'
import { MensajeVacio } from '@/components/ui/MensajeVacio'
import { PackageSearch, Pencil, Check, X } from 'lucide-react'
import { formatCOP } from '@/lib/utils/format'
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
      setError('El precio ingresado no es válido.')
      return
    }
    setError(null)
    setLoadingId(priceId)
    try {
      const res = await fetch(`/api/almacen/precios/${priceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ unit_price: n }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'No se pudo guardar el precio.')
        return
      }
      setFilas((rows) => rows.map((r) => (r.price_id === priceId ? { ...r, unit_price: n } : r)))
      setEditing(null)
    } finally {
      setLoadingId(null)
    }
  }

  async function toggleDisponible(priceId: string, isAvailable: boolean) {
    setError(null)
    setLoadingId(priceId)
    try {
      const res = await fetch(`/api/almacen/precios/${priceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_available: !isAvailable }),
      })
      const json = (await res.json()) as { error?: string }
      if (!res.ok) {
        setError(json.error ?? 'No se pudo actualizar la disponibilidad.')
        return
      }
      setFilas((rows) =>
        rows.map((r) => (r.price_id === priceId ? { ...r, is_available: !isAvailable } : r))
      )
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      {error ? (
        <div className="mb-4">
          <MensajeError message={error} onRetry={() => setError(null)} />
        </div>
      ) : null}

      {filas.length === 0 ? (
        <MensajeVacio
          Icon={PackageSearch}
          title="Sin productos cargados"
          description="Aún no tienes productos con precios asignados en este almacén."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filas.map((r) => (
            <li
              key={r.price_id}
              className="rounded-2xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Info del producto */}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#252320]">{r.name}</p>
                  {r.presentation ? (
                    <p className="text-sm text-[#736E64]">{r.presentation}</p>
                  ) : null}
                  <p className="text-xs text-[#A39E94]">{r.unit_of_measure}</p>
                </div>

                {/* Controles */}
                <div className="flex flex-wrap items-center gap-2">
                  {editing === r.price_id ? (
                    <>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={precioDraft}
                        onChange={(e) => setPrecioDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void guardarPrecio(r.price_id)
                          if (e.key === 'Escape') setEditing(null)
                        }}
                        aria-label="Nuevo precio"
                        className="w-36 rounded-xl border border-[#D4CEC4] px-3 py-2 text-base text-[#252320] outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/15"
                        placeholder="Precio COP"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={loadingId === r.price_id}
                        onClick={() => void guardarPrecio(r.price_id)}
                        aria-label="Guardar precio"
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D7A2D] text-white disabled:opacity-50 active:scale-90"
                      >
                        <Check size={18} aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        aria-label="Cancelar edición"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] active:scale-90"
                      >
                        <X size={18} aria-hidden />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="tabular-nums text-lg font-bold text-[#2D7A2D]">
                        {formatCOP(r.unit_price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(r.price_id)
                          setPrecioDraft(String(Math.round(r.unit_price)))
                        }}
                        aria-label={`Editar precio de ${r.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] hover:border-[#2D7A2D]/40 active:scale-90 transition-all"
                      >
                        <Pencil size={15} aria-hidden />
                      </button>
                    </>
                  )}

                  {/* Toggle disponible */}
                  <button
                    type="button"
                    disabled={loadingId === r.price_id}
                    onClick={() => void toggleDisponible(r.price_id, r.is_available)}
                    className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all disabled:opacity-50 active:scale-95 ${
                      r.is_available
                        ? 'bg-[#F0F7F0] text-[#2D7A2D] border border-[#A8D1A8]'
                        : 'bg-[#FDF6EC] text-[#8B6914] border border-[#D4B87A]'
                    }`}
                  >
                    {r.is_available ? 'Disponible' : 'Agotado'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
