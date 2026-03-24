'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Minus, Plus, ShoppingBag, Trash2, Package } from 'lucide-react'
import {
  useCartStore,
  cartTotalCents,
  groupCartByWarehouse,
} from '@/lib/cart/store'
import { formatCOP } from '@/lib/utils/format'
import { MensajeError } from '@/components/ui/MensajeError'
import { MensajeVacio } from '@/components/ui/MensajeVacio'

const NOTES_MAX = 500
const QTY_MIN = 1
const QTY_MAX = 9_999

export default function CarritoPage() {
  const router = useRouter()
  const lines = useCartStore((s) => s.lines)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeLine = useCartStore((s) => s.removeLine)
  const clear = useCartStore((s) => s.clear)

  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const grouped = useMemo(() => groupCartByWarehouse(lines), [lines])
  const total = useMemo(() => cartTotalCents(lines), [lines])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (lines.length === 0) return

    const trimmed = notes.trim()
    if (trimmed.length > NOTES_MAX) {
      setError(`Las notas no pueden superar ${NOTES_MAX} caracteres.`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: lines.map((l) => ({
            product_id: l.productId,
            warehouse_id: l.warehouseId,
            quantity: l.quantity,
          })),
          notes: trimmed || undefined,
          channel: 'pwa',
        }),
      })
      const json = (await res.json()) as {
        error?: string
        orders?: { id: string }[]
      }
      if (!res.ok) {
        if (res.status === 401) {
          router.push(
            `/login?next=${encodeURIComponent('/carrito')}`
          )
          return
        }
        setError(json.error ?? 'No se pudo crear el pedido. Reintenta en un momento.')
        return
      }
      clear()
      const ids = json.orders?.map((o) => o.id).filter(Boolean) ?? []
      if (ids.length === 1) {
        router.push(
          `/catalogo/pedido/confirmacion?id=${encodeURIComponent(ids[0])}`
        )
      } else if (ids.length > 1) {
        router.push(
          `/catalogo/pedido/confirmacion?ids=${encodeURIComponent(ids.join(','))}`
        )
      } else {
        setError('No recibimos los pedidos. Intenta de nuevo.')
      }
    } catch {
      setError('Sin conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (lines.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] px-4 py-6">
        <div className="mx-auto max-w-lg">
          <h1 className="text-xl font-bold text-[#252320]">Carrito</h1>
          <MensajeVacio
            Icon={Package}
            title="Tu carrito está vacío"
            description="Agrega productos desde el catálogo con el botón +."
            className="mt-6"
            action={{
              label: 'Ir al catálogo',
              onClick: () => router.push('/catalogo'),
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-6">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-[#252320]">Carrito</h1>
          <button
            type="button"
            onClick={() => clear()}
            className="text-sm font-medium text-[#736E64] underline"
          >
            Vaciar todo
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {Array.from(grouped.entries()).map(([warehouseId, groupLines]) => (
            <div
              key={warehouseId}
              className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)]"
            >
              <p className="text-sm font-semibold text-[#3A3732]">
                {groupLines[0]?.warehouseName ?? 'Almacén'}
              </p>
              <ul className="mt-3 flex flex-col gap-3">
                {groupLines.map((line) => (
                  <li
                    key={`${line.productId}-${line.warehouseId}`}
                    className="flex gap-3 border-t border-[#F0ECE6] pt-3 first:border-t-0 first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#252320]">
                        {line.productName}
                      </p>
                      <p className="text-xs text-[#736E64]">
                        {[line.presentation, line.unitOfMeasure]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <p className="mt-1 text-sm tabular-nums text-[#2D7A2D]">
                        {formatCOP(line.unitPrice)} c/u
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label="Restar uno"
                          disabled={line.quantity <= QTY_MIN}
                          onClick={() =>
                            setQuantity(
                              line.productId,
                              line.warehouseId,
                              line.quantity - 1
                            )
                          }
                          className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40"
                        >
                          <Minus size={20} aria-hidden />
                        </button>
                        <span className="tabular-nums min-w-[3ch] text-center text-lg font-bold">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Sumar uno"
                          disabled={line.quantity >= QTY_MAX}
                          onClick={() =>
                            setQuantity(
                              line.productId,
                              line.warehouseId,
                              line.quantity + 1
                            )
                          }
                          className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40"
                        >
                          <Plus size={20} aria-hidden />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          removeLine(line.productId, line.warehouseId)
                        }
                        className="flex items-center gap-1 text-xs font-medium text-[#C23B22]"
                        aria-label="Quitar del carrito"
                      >
                        <Trash2 size={14} aria-hidden />
                        Quitar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <label
              htmlFor="cart-notes"
              className="text-sm font-semibold text-[#3A3732]"
            >
              Notas para los almacenes{' '}
              <span className="font-normal text-[#A39E94]">(opcional)</span>
            </label>
            <textarea
              id="cart-notes"
              rows={3}
              value={notes}
              maxLength={NOTES_MAX + 10}
              onChange={(ev) => setNotes(ev.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#D4CEC4] bg-white px-4 py-3 text-base text-[#252320] outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/20"
              placeholder="Ej.: entregar en la vereda el martes"
            />
          </div>

          <div className="rounded-xl border border-[#A8D1A8] bg-[#F0F7F0] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#236023]">Total</span>
              <span className="tabular-nums text-xl font-bold text-[#2D7A2D]">
                {formatCOP(total)}
              </span>
            </div>
            {grouped.size > 1 ? (
              <p className="mt-2 text-xs text-[#4A9B4A]">
                Se crearán {grouped.size} pedidos (uno por almacén). El pago
                acuerdas en cada almacén.
              </p>
            ) : (
              <p className="mt-2 text-xs text-[#4A9B4A]">
                Precio final confirmado por el almacén
              </p>
            )}
          </div>

          {error ? <MensajeError message={error} /> : null}

          <button
            type="submit"
            disabled={loading || notes.trim().length > NOTES_MAX}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#2D7A2D] text-base font-semibold text-white hover:bg-[#236023] disabled:opacity-60"
          >
            <ShoppingBag size={18} aria-hidden />
            {loading ? 'Enviando…' : 'Confirmar pedido(s)'}
          </button>

          <Link
            href="/catalogo"
            className="flex h-14 items-center justify-center rounded-xl border border-[#D4CEC4] text-base font-medium text-[#524E46]"
          >
            Seguir comprando
          </Link>
        </form>
      </div>
    </div>
  )
}
