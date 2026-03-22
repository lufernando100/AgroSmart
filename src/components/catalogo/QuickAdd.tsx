'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, ShoppingBag, X, Loader2 } from 'lucide-react'
import { formatCOP } from '@/lib/utils/format'

type Props = {
  productId: string
  warehouseId: string
  warehouseName: string
  unitPrice: number
  productName: string
  /** Callback when the order is successfully created */
  onOrderCreated?: (orderId: string) => void
}

type State = 'idle' | 'open' | 'loading' | 'ok' | 'error'

/**
 * "+" button that opens a mini quantity selector directly on the catalog card
 * without navigating to the detail page. Reduces the purchase flow from 4 taps to 3.
 */
export function QuickAdd({
  productId,
  warehouseId,
  warehouseName,
  unitPrice,
  productName,
  onOrderCreated,
}: Props) {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')
  const [quantity, setQuantity] = useState(1)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setState('idle')
    setErrorMsg(null)
  }, [])

  // Close on Escape key
  useEffect(() => {
    if (state !== 'open') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [state, close])

  // Close on click outside the drawer
  useEffect(() => {
    if (state !== 'open') return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [state, close])

  function open(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setQuantity(1)
    setErrorMsg(null)
    setState('open')
  }

  function changeQuantity(delta: number) {
    setQuantity((q) => Math.min(9999, Math.max(1, q + delta)))
  }

  async function confirm(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setState('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          warehouse_id: warehouseId,
          items: [{ product_id: productId, quantity }],
          channel: 'pwa',
        }),
      })
      const json = (await res.json()) as { error?: string; id?: string }
      if (!res.ok) {
        setErrorMsg(json.error ?? 'No se pudo crear el pedido.')
        setState('error')
        return
      }
      setState('ok')
      if (json.id) {
        onOrderCreated?.(json.id)
        // Brief pause to show the success tick before navigating
        setTimeout(() => {
          router.push(`/catalogo/pedido/confirmacion?id=${encodeURIComponent(json.id!)}`)
        }, 600)
      }
    } catch {
      setErrorMsg('Sin conexión. Verifica tu internet.')
      setState('error')
    }
  }

  const subtotal = unitPrice * quantity

  if (state === 'idle') {
    return (
      <button
        type="button"
        aria-label={`Agregar ${productName} al pedido`}
        onClick={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2D7A2D] text-white shadow-md transition-all active:scale-90 hover:bg-[#236023] hover:shadow-lg"
      >
        <Plus size={18} strokeWidth={2.5} aria-hidden />
      </button>
    )
  }

  return (
    <div
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Agregar ${productName}`}
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-x-0 bottom-0 z-20 rounded-b-xl border-t border-[#E8E4DD] bg-white p-4 shadow-[0_-4px_24px_rgba(18,17,16,0.12)] transition-all duration-200 translate-y-0 opacity-100"
    >
      {/* Drawer header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#252320] leading-tight">{productName}</p>
          <p className="text-xs text-[#736E64]">{warehouseName}</p>
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={close}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F3EF] text-[#736E64]"
        >
          <X size={14} aria-hidden />
        </button>
      </div>

      {/* Quantity selector + price */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Restar uno"
          disabled={quantity <= 1 || state === 'loading' || state === 'ok'}
          onClick={() => changeQuantity(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40 active:scale-90"
        >
          <Minus size={16} aria-hidden />
        </button>

        <span
          aria-live="polite"
          aria-label={`${quantity} bultos`}
          className="tabular-nums w-8 text-center text-xl font-bold text-[#252320]"
        >
          {quantity}
        </span>

        <button
          type="button"
          aria-label="Sumar uno"
          disabled={quantity >= 9999 || state === 'loading' || state === 'ok'}
          onClick={() => changeQuantity(1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40 active:scale-90"
        >
          <Plus size={16} aria-hidden />
        </button>

        <div className="flex-1 text-right">
          <p className="tabular-nums text-lg font-bold text-[#2D7A2D]">
            {formatCOP(subtotal)}
          </p>
          <p className="text-xs text-[#A39E94]">
            {formatCOP(unitPrice)} / bulto
          </p>
        </div>
      </div>

      {/* Error message */}
      {state === 'error' && errorMsg ? (
        <p role="alert" className="mt-2 text-xs text-[#C23B22]">
          {errorMsg}
        </p>
      ) : null}

      {/* Confirm button */}
      <button
        type="button"
        disabled={state === 'loading' || state === 'ok'}
        onClick={confirm}
        className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] ${
          state === 'ok'
            ? 'bg-[#4A9B4A]'
            : 'bg-[#2D7A2D] hover:bg-[#236023] disabled:opacity-60'
        }`}
      >
        {state === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Enviando…
          </>
        ) : state === 'ok' ? (
          <>✓ Pedido enviado</>
        ) : (
          <>
            <ShoppingBag size={16} aria-hidden />
            Pedir {quantity} bulto{quantity !== 1 ? 's' : ''} · {formatCOP(subtotal)}
          </>
        )}
      </button>
    </div>
  )
}
