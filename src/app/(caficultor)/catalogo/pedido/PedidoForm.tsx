'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Package, Store } from 'lucide-react'
import { formatCOP } from '@/lib/utils/format'
import { MensajeError } from '@/components/ui/MensajeError'

type Props = {
  productoId: string
  almacenId: string
  productoNombre: string
  almacenNombre: string
  precioUnitario: number
  presentacion: string | null
  unidadMedida: string
}

const CANTIDAD_MIN = 1
const CANTIDAD_MAX = 9_999
const NOTAS_MAX = 500

export function PedidoForm({
  productoId,
  almacenId,
  productoNombre,
  almacenNombre,
  precioUnitario,
  presentacion,
  unidadMedida,
}: Props) {
  const router = useRouter()
  const [cantidad, setCantidad] = useState(1)
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function cambiarCantidad(delta: number) {
    setCantidad((c) => Math.min(CANTIDAD_MAX, Math.max(CANTIDAD_MIN, c + delta)))
  }

  /** Validaciones client-side antes de enviar al server. */
  function validar(): string | null {
    if (cantidad < CANTIDAD_MIN || cantidad > CANTIDAD_MAX) {
      return `La cantidad debe estar entre ${CANTIDAD_MIN} y ${CANTIDAD_MAX.toLocaleString('es-CO')}.`
    }
    if (!Number.isInteger(cantidad)) {
      return 'La cantidad debe ser un número entero.'
    }
    if (notas.trim().length > NOTAS_MAX) {
      return `Las notas no pueden superar ${NOTAS_MAX} caracteres.`
    }
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validationError = validar()
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
          almacen_id: almacenId,
          items: [{ producto_id: productoId, cantidad }],
          notas: notas.trim() || undefined,
          canal: 'pwa',
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

  const subtotal = precioUnitario * cantidad
  const notasRestantes = NOTAS_MAX - notas.length
  const notasExcedidas = notas.length > NOTAS_MAX

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* Info del producto */}
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F3EF]">
            <Package size={22} className="text-[#736E64]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-[#252320]">{productoNombre}</p>
            <p className="text-sm text-[#736E64]">
              {[presentacion, unidadMedida].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-[#E8E4DD] pt-3 text-sm text-[#736E64]">
          <Store size={14} aria-hidden />
          <span>{almacenNombre}</span>
        </div>

        <p className="mt-2 tabular-nums text-2xl font-bold text-[#2D7A2D]">
          {formatCOP(precioUnitario)}{' '}
          <span className="text-sm font-normal text-[#736E64]">/ unidad</span>
        </p>
      </div>

      {/* Selector de cantidad */}
      <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)]">
        <p className="mb-3 text-sm font-semibold text-[#3A3732]">Cantidad</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Restar uno"
            disabled={cantidad <= CANTIDAD_MIN}
            onClick={() => cambiarCantidad(-1)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40"
          >
            <Minus size={20} aria-hidden />
          </button>
          <span
            className="tabular-nums min-w-[3ch] text-center text-2xl font-bold text-[#252320]"
            aria-live="polite"
            aria-label={`${cantidad} bultos`}
          >
            {cantidad}
          </span>
          <button
            type="button"
            aria-label="Sumar uno"
            disabled={cantidad >= CANTIDAD_MAX}
            onClick={() => cambiarCantidad(1)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E8E4DD] bg-[#F5F3EF] text-[#524E46] disabled:opacity-40"
          >
            <Plus size={20} aria-hidden />
          </button>
          <span className="text-sm text-[#736E64]">bultos</span>
        </div>
      </div>

      {/* Notas */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="notas" className="text-sm font-semibold text-[#3A3732]">
            Notas para el almacén{' '}
            <span className="font-normal text-[#A39E94]">(opcional)</span>
          </label>
          <span
            className={`text-xs tabular-nums ${
              notasExcedidas ? 'text-[#C23B22]' : 'text-[#A39E94]'
            }`}
            aria-live="polite"
          >
            {notasRestantes < 100 ? `${notasRestantes} restantes` : ''}
          </span>
        </div>
        <textarea
          id="notas"
          rows={3}
          value={notas}
          maxLength={NOTAS_MAX + 10} /* el server rechaza >500, cliente avisa antes */
          onChange={(ev) => setNotas(ev.target.value)}
          aria-describedby={notasExcedidas ? 'notas-error' : undefined}
          className={`w-full rounded-xl border px-4 py-3 text-base text-[#252320] placeholder-[#A39E94] outline-none focus:ring-2 ${
            notasExcedidas
              ? 'border-[#C23B22] focus:border-[#C23B22] focus:ring-[#C23B22]/20'
              : 'border-[#D4CEC4] focus:border-[#2D7A2D] focus:ring-[#2D7A2D]/20'
          } bg-white`}
          placeholder="Ej.: entregar en la vereda el martes"
        />
        {notasExcedidas ? (
          <p id="notas-error" className="mt-1 text-xs text-[#C23B22]">
            Las notas no pueden superar {NOTAS_MAX} caracteres.
          </p>
        ) : null}
      </div>

      {/* Resumen de total */}
      <div className="rounded-xl border border-[#A8D1A8] bg-[#F0F7F0] p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#236023]">
            {cantidad} × {formatCOP(precioUnitario)}
          </span>
          <span className="tabular-nums text-xl font-bold text-[#2D7A2D]">
            {formatCOP(subtotal)}
          </span>
        </div>
        <p className="mt-1 text-xs text-[#4A9B4A]">
          Precio final confirmado por el almacén
        </p>
      </div>

      {/* Error — usa MensajeError con role="alert" y opción de reintentar */}
      {error ? (
        <MensajeError
          message={error}
          onRetry={() => {
            setError(null)
            void onSubmit(new Event('submit') as unknown as React.FormEvent)
          }}
        />
      ) : null}

      {/* Acciones */}
      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={loading || notasExcedidas}
          className="h-14 rounded-xl bg-[#2D7A2D] text-base font-semibold text-white hover:bg-[#236023] disabled:opacity-60"
        >
          {loading
            ? 'Enviando pedido…'
            : `Pedir ${cantidad} bulto${cantidad !== 1 ? 's' : ''} — ${formatCOP(subtotal)}`}
        </button>
        <Link
          href={`/catalogo/${productoId}`}
          className="flex h-12 items-center justify-center rounded-xl border border-[#D4CEC4] text-base font-medium text-[#524E46]"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
