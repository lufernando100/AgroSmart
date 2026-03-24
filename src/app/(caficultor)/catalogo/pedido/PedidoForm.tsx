'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Package, Store } from 'lucide-react'
import { formatCOP } from '@/lib/utils/format'
import { MensajeError } from '@/components/ui/MensajeError'

type Props = {
  productId: string
  warehouseId: string
  productName: string
  warehouseName: string
  unitPrice: number
  presentation: string | null
  unitOfMeasure: string
}

const QTY_MIN = 1
const QTY_MAX = 9_999
const NOTES_MAX = 500

export function PedidoForm({
  productId,
  warehouseId,
  productName,
  warehouseName,
  unitPrice,
  presentation,
  unitOfMeasure,
}: Props) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function changeQuantity(delta: number) {
    setQuantity((q) => Math.min(QTY_MAX, Math.max(QTY_MIN, q + delta)))
  }

  /** Client-side validation before sending to the server. */
  function validate(): string | null {
    if (quantity < QTY_MIN || quantity > QTY_MAX) {
      return `La cantidad debe estar entre ${QTY_MIN} y ${QTY_MAX.toLocaleString('es-CO')}.`
    }
    if (!Number.isInteger(quantity)) {
      return 'La cantidad debe ser un número entero.'
    }
    if (notes.trim().length > NOTES_MAX) {
      return `Las notas no pueden superar ${NOTES_MAX} caracteres.`
    }
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          warehouse_id: warehouseId,
          items: [{ product_id: productId, quantity }],
          notes: notes.trim() || undefined,
          channel: 'pwa',
        }),
      })
      const json = (await res.json()) as { error?: string; id?: string }
      if (!res.ok) {
        setError(json.error ?? 'No se pudo crear el pedido. Reintenta en un momento.')
        return
      }
      if (json.id) {
        router.push(`/catalogo/pedido/confirmacion?id=${encodeURIComponent(json.id)}`)
      }
    } catch {
      setError('Sin conexión. Verifica tu internet e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = unitPrice * quantity
  const notesRemaining = NOTES_MAX - notes.length
  const notesExceeded = notes.length > NOTES_MAX

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* Product info card */}
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F5F3EF]">
            <Package size={22} className="text-[#736E64]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-[#252320]">{productName}</p>
            <p className="text-sm text-[#736E64]">
              {[presentation, unitOfMeasure].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-[#E8E4DD] pt-3 text-sm text-[#736E64]">
          <Store size={14} aria-hidden />
          <span>{warehouseName}</span>
        </div>

        <p className="mt-2 tabular-nums text-2xl font-bold text-[#2D7A2D]">
          {formatCOP(unitPrice)}{' '}
          <span className="text-sm font-normal text-[#736E64]">/ unidad</span>
        </p>
      </div>

      {/* Quantity selector */}
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)]">
        <p className="mb-3 text-sm font-semibold text-[#3A3732]">Cantidad</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Restar uno"
            disabled={quantity <= QTY_MIN}
            onClick={() => changeQuantity(-1)}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40"
          >
            <Minus size={20} aria-hidden />
          </button>
          <span
            className="tabular-nums min-w-[3ch] text-center text-2xl font-bold text-[#252320]"
            aria-live="polite"
            aria-label={`${quantity} bultos`}
          >
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Sumar uno"
            disabled={quantity >= QTY_MAX}
            onClick={() => changeQuantity(1)}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40"
          >
            <Plus size={20} aria-hidden />
          </button>
          <span className="text-sm text-[#736E64]">bultos</span>
        </div>
      </div>

      {/* Notes for the warehouse */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="notes" className="text-sm font-semibold text-[#3A3732]">
            Notas para el almacén{' '}
            <span className="font-normal text-[#A39E94]">(opcional)</span>
          </label>
          <span
            className={`text-xs tabular-nums ${
              notesExceeded ? 'text-[#C23B22]' : 'text-[#A39E94]'
            }`}
            aria-live="polite"
          >
            {notesRemaining < 100 ? `${notesRemaining} restantes` : ''}
          </span>
        </div>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          maxLength={NOTES_MAX + 10} /* server rejects >500, client warns before that */
          onChange={(ev) => setNotes(ev.target.value)}
          aria-describedby={notesExceeded ? 'notes-error' : undefined}
          className={`w-full rounded-xl border px-4 py-3 text-base text-[#252320] placeholder-[#A39E94] outline-none focus:ring-2 ${
            notesExceeded
              ? 'border-[#C23B22] focus:border-[#C23B22] focus:ring-[#C23B22]/20'
              : 'border-[#D4CEC4] focus:border-[#2D7A2D] focus:ring-[#2D7A2D]/20'
          } bg-white`}
          placeholder="Ej.: entregar en la vereda el martes"
        />
        {notesExceeded ? (
          <p id="notes-error" className="mt-1 text-xs text-[#C23B22]">
            Las notas no pueden superar {NOTES_MAX} caracteres.
          </p>
        ) : null}
      </div>

      {/* Order total summary */}
      <div className="rounded-xl border border-[#A8D1A8] bg-[#F0F7F0] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#236023]">
            {quantity} × {formatCOP(unitPrice)}
          </span>
          <span className="tabular-nums text-xl font-bold text-[#2D7A2D]">
            {formatCOP(subtotal)}
          </span>
        </div>
        <p className="mt-1 text-xs text-[#4A9B4A]">
          Precio final confirmado por el almacén
        </p>
      </div>

      {/* Error display with retry option */}
      {error ? (
        <MensajeError
          message={error}
          onRetry={() => {
            setError(null)
            void onSubmit(new Event('submit') as unknown as React.FormEvent)
          }}
        />
      ) : null}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={loading || notesExceeded}
          className="h-14 rounded-xl bg-[#2D7A2D] text-base font-semibold text-white hover:bg-[#236023] disabled:opacity-60"
        >
          {loading
            ? 'Enviando pedido…'
            : `Pedir ${quantity} bulto${quantity !== 1 ? 's' : ''} — ${formatCOP(subtotal)}`}
        </button>
        <Link
          href={`/catalogo/${productId}`}
          className="flex h-12 items-center justify-center rounded-xl border border-[#D4CEC4] text-base font-medium text-[#524E46]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
