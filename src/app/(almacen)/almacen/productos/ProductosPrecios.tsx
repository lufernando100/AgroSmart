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
              className="rounded-[2.5rem] border-2 border-[#1A0F0A]/10 bg-white p-6 shadow-xl transition-all"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Info del producto */}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1A0F0A]">{r.name}</p>
                  {r.presentation ? (
                    <p className="text-sm text-[#7B675B]">{r.presentation}</p>
                  ) : null}
                  <p className="text-xs text-[#9C8F85]">{r.unit_of_measure}</p>
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
                        className="h-12 w-32 rounded-2xl border-2 border-[#1A0F0A]/20 px-4 text-base text-[#1A0F0A] outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15"
                        placeholder="Precio COP"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={loadingId === r.price_id}
                        onClick={() => void guardarPrecio(r.price_id)}
                        aria-label="Guardar precio"
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#059669] text-white disabled:opacity-50 active:scale-95"
                      >
                        <Check size={24} aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(null)}
                        aria-label="Cancelar edición"
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#1A0F0A]/10 bg-[#FDFBF7] text-[#5B473D] active:scale-95"
                      >
                        <X size={24} aria-hidden />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="tabular-nums text-lg font-bold text-[#059669]">
                        {formatCOP(r.unit_price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(r.price_id)
                          setPrecioDraft(String(Math.round(r.unit_price)))
                        }}
                        aria-label={`Editar precio de ${r.name}`}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#1A0F0A]/10 bg-[#FDFBF7] text-[#5B473D] hover:border-[#059669]/40 active:scale-95 transition-all"
                      >
                        <Pencil size={20} aria-hidden />
                      </button>
                    </>
                  )}

                  {/* Toggle disponible */}
                  <button
                    type="button"
                    disabled={loadingId === r.price_id}
                    onClick={() => void toggleDisponible(r.price_id, r.is_available)}
                    className={`h-12 rounded-2xl px-5 text-sm font-semibold transition-all disabled:opacity-50 active:scale-95 ${
                      r.is_available
                        ? 'bg-[#ECFDF5] text-[#059669] border-2 border-[#A7F3D0]'
                        : 'bg-[#FDF6EC] text-[#D97706] border-2 border-[#D4B87A]'
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
