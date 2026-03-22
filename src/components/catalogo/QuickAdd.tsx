'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, ShoppingBag, X, Loader2 } from 'lucide-react'
import { formatCOP } from '@/lib/utils/format'

type Props = {
  productoId: string
  almacenId: string
  almacenNombre: string
  precioUnitario: number
  productoNombre: string
  /** Callback para cuando el pedido se crea exitosamente */
  onPedidoCreado?: (pedidoId: string) => void
}

type Estado = 'idle' | 'open' | 'loading' | 'ok' | 'error'

/**
 * Botón "+" que abre un mini-selector de cantidad directamente en la tarjeta
 * del catálogo, sin navegar al detalle. Reduce el flujo de compra de 4 taps a 3.
 */
export function QuickAdd({
  productoId,
  almacenId,
  almacenNombre,
  precioUnitario,
  productoNombre,
  onPedidoCreado,
}: Props) {
  const router = useRouter()
  const [estado, setEstado] = useState<Estado>('idle')
  const [cantidad, setCantidad] = useState(1)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  const cerrar = useCallback(() => {
    setEstado('idle')
    setErrorMsg(null)
  }, [])

  // Cerrar con Escape
  useEffect(() => {
    if (estado !== 'open') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [estado, cerrar])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (estado !== 'open') return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        cerrar()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [estado, cerrar])

  function abrir(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setCantidad(1)
    setErrorMsg(null)
    setEstado('open')
  }

  function cambiarCantidad(delta: number) {
    setCantidad((c) => Math.min(9999, Math.max(1, c + delta)))
  }

  async function confirmar(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setEstado('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          almacen_id: almacenId,
          items: [{ producto_id: productoId, cantidad }],
          canal: 'pwa',
        }),
      })
      const json = (await res.json()) as { error?: string; id?: string }
      if (!res.ok) {
        setErrorMsg(json.error ?? 'No se pudo crear el pedido.')
        setEstado('error')
        return
      }
      setEstado('ok')
      if (json.id) {
        onPedidoCreado?.(json.id)
        // Pequeña pausa para mostrar el tick antes de navegar
        setTimeout(() => {
          router.push(`/catalogo/pedido/confirmacion?id=${encodeURIComponent(json.id!)}`)
        }, 600)
      }
    } catch {
      setErrorMsg('Sin conexión. Verifica tu internet.')
      setEstado('error')
    }
  }

  const subtotal = precioUnitario * cantidad

  if (estado === 'idle') {
    return (
      <button
        type="button"
        aria-label={`Agregar ${productoNombre} al pedido`}
        onClick={abrir}
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
      aria-label={`Agregar ${productoNombre}`}
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-x-0 bottom-0 z-20 rounded-b-xl border-t border-[#E8E4DD] bg-white p-4 shadow-[0_-4px_24px_rgba(18,17,16,0.12)] transition-all duration-200 translate-y-0 opacity-100"
    >
      {/* Encabezado */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#252320] leading-tight">{productoNombre}</p>
          <p className="text-xs text-[#736E64]">{almacenNombre}</p>
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={cerrar}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F3EF] text-[#736E64]"
        >
          <X size={14} aria-hidden />
        </button>
      </div>

      {/* Selector de cantidad + precio */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Restar uno"
          disabled={cantidad <= 1 || estado === 'loading' || estado === 'ok'}
          onClick={() => cambiarCantidad(-1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40 active:scale-90"
        >
          <Minus size={16} aria-hidden />
        </button>

        <span
          aria-live="polite"
          aria-label={`${cantidad} bultos`}
          className="tabular-nums w-8 text-center text-xl font-bold text-[#252320]"
        >
          {cantidad}
        </span>

        <button
          type="button"
          aria-label="Sumar uno"
          disabled={cantidad >= 9999 || estado === 'loading' || estado === 'ok'}
          onClick={() => cambiarCantidad(1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40 active:scale-90"
        >
          <Plus size={16} aria-hidden />
        </button>

        <div className="flex-1 text-right">
          <p className="tabular-nums text-lg font-bold text-[#2D7A2D]">
            {formatCOP(subtotal)}
          </p>
          <p className="text-xs text-[#A39E94]">
            {formatCOP(precioUnitario)} / bulto
          </p>
        </div>
      </div>

      {/* Error */}
      {estado === 'error' && errorMsg ? (
        <p role="alert" className="mt-2 text-xs text-[#C23B22]">
          {errorMsg}
        </p>
      ) : null}

      {/* Botón confirmar */}
      <button
        type="button"
        disabled={estado === 'loading' || estado === 'ok'}
        onClick={confirmar}
        className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97] ${
          estado === 'ok'
            ? 'bg-[#4A9B4A]'
            : 'bg-[#2D7A2D] hover:bg-[#236023] disabled:opacity-60'
        }`}
      >
        {estado === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Enviando…
          </>
        ) : estado === 'ok' ? (
          <>✓ Pedido enviado</>
        ) : (
          <>
            <ShoppingBag size={16} aria-hidden />
            Pedir {cantidad} bulto{cantidad !== 1 ? 's' : ''} · {formatCOP(subtotal)}
          </>
        )}
      </button>
    </div>
  )
}
