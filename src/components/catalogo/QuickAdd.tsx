'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Plus, Minus, ShoppingCart, X, Loader2 } from 'lucide-react'
import { formatCOP } from '@/lib/utils/format'
import { useCartStore } from '@/lib/cart/store'

type Props = {
  productId: string
  warehouseId: string
  warehouseName: string
  unitPrice: number
  productName: string
  presentation: string | null
  unitOfMeasure: string
}

type State = 'idle' | 'open' | 'loading' | 'ok' | 'error'

/**
 * "+" opens quantity selector; confirms by adding to cart (persisted in localStorage).
 * Sheet is portaled to document.body so parent CSS (e.g. hover:translate on cards)
 * does not create a containing block that crushes `position:fixed`.
 */
export function QuickAdd({
  productId,
  warehouseId,
  warehouseName,
  unitPrice,
  productName,
  presentation,
  unitOfMeasure,
}: Props) {
  const addLine = useCartStore((s) => s.addLine)
  const [state, setState] = useState<State>('idle')
  const [quantity, setQuantity] = useState(1)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    if (state === 'loading') return
    setState('idle')
    setErrorMsg(null)
  }, [state])

  useEffect(() => {
    if (state !== 'open' && state !== 'error') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
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

  function confirm(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setState('loading')
    setErrorMsg(null)
    try {
      addLine({
        productId,
        warehouseId,
        warehouseName,
        unitPrice,
        productName,
        presentation,
        unitOfMeasure,
        quantity,
      })
      setState('ok')
      window.setTimeout(() => {
        setState('idle')
      }, 1200)
    } catch {
      setErrorMsg('No se pudo guardar en el carrito.')
      setState('error')
    }
  }

  const subtotal = unitPrice * quantity
  const sheetOpen = state !== 'idle'

  useEffect(() => {
    if (!sheetOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheetOpen])

  if (state === 'idle') {
    return (
      <button
        type="button"
        aria-label={`Agregar ${productName} al carrito`}
        onClick={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2D7A2D] text-white shadow-md transition-all active:scale-90 hover:bg-[#236023] hover:shadow-lg"
      >
        <Plus size={18} strokeWidth={2.5} aria-hidden />
      </button>
    )
  }

  const sheet = (
    <>
      <div
        className="fixed inset-0 z-[100] bg-[#252320]/35"
        aria-hidden
        onMouseDown={(e) => {
          if (state === 'loading') return
          e.preventDefault()
          close()
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Agregar ${productName}`}
        onMouseDown={(e) => e.stopPropagation()}
        className="fixed left-1/2 z-[110] max-h-[min(85vh,32rem)] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 overflow-y-auto rounded-2xl border border-[#E8E4DD] bg-white p-4 shadow-[0_8px_40px_rgba(18,17,16,0.18)] bottom-[max(5.5rem,env(safe-area-inset-bottom,0px))] md:bottom-8"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[#252320] leading-tight">
              {productName}
            </p>
            <p className="text-xs text-[#736E64]">{warehouseName}</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={close}
            disabled={state === 'loading'}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F3EF] text-[#736E64]"
          >
            <X size={14} aria-hidden />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Restar uno"
            disabled={quantity <= 1 || state === 'loading'}
            onClick={() => changeQuantity(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40 active:scale-90"
          >
            <Minus size={16} aria-hidden />
          </button>

          <span
            aria-live="polite"
            aria-label={`${quantity} unidades`}
            className="tabular-nums w-8 text-center text-xl font-bold text-[#252320]"
          >
            {quantity}
          </span>

          <button
            type="button"
            aria-label="Sumar uno"
            disabled={quantity >= 9999 || state === 'loading'}
            onClick={() => changeQuantity(1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40 active:scale-90"
          >
            <Plus size={16} aria-hidden />
          </button>

          <div className="min-w-0 flex-1 text-right">
            <p className="tabular-nums text-lg font-bold text-[#2D7A2D]">
              {formatCOP(subtotal)}
            </p>
            <p className="text-xs text-[#A39E94]">
              {formatCOP(unitPrice)} / unidad
            </p>
          </div>
        </div>

        {state === 'error' && errorMsg ? (
          <p role="alert" className="mt-2 text-xs text-[#C23B22]">
            {errorMsg}
          </p>
        ) : null}

        <button
          type="button"
          disabled={state === 'loading' || state === 'ok'}
          onClick={confirm}
          className={`mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] ${
            state === 'ok'
              ? 'bg-[#4A9B4A]'
              : 'bg-[#2D7A2D] hover:bg-[#236023] disabled:opacity-60'
          }`}
        >
          {state === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden />
              Guardando…
            </>
          ) : state === 'ok' ? (
            <>✓ Agregado al carrito</>
          ) : (
            <>
              <ShoppingCart size={16} aria-hidden />
              Añadir {quantity} al carrito · {formatCOP(subtotal)}
            </>
          )}
        </button>

        <Link
          href="/carrito"
          className="mt-2 flex h-10 w-full items-center justify-center rounded-xl border border-[#D4CEC4] text-sm font-medium text-[#524E46]"
        >
          Ver carrito
        </Link>
      </div>
    </>
  )

  return (
    <>
      <span className="flex h-9 w-9 shrink-0" aria-hidden />
      {typeof document !== 'undefined'
        ? createPortal(sheet, document.body)
        : null}
    </>
  )
}
