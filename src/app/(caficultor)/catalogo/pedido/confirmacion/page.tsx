import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle2, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOrderForUser } from '@/lib/pedidos/service'
import { isUuid } from '@/lib/catalogo/uuid'
import { PedidoEstadoRealtime } from '@/components/pedidos/PedidoEstadoRealtime'
import type { OrderStatus } from '@/types/database'
import { formatCOP, formatFecha } from '@/lib/utils/format'

type PageProps = {
  searchParams: Promise<{ id?: string }>
}

export default async function PedidoConfirmacionPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const id = sp.id

  if (!id || !isUuid(id)) {
    redirect('/catalogo')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/catalogo/pedido/confirmacion?id=${id}`)}`)
  }

  const role = user.user_metadata?.role as string | undefined
  const data = await getOrderForUser(id, user.id, role)
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFAF8] px-4 text-center">
        <p className="text-[#736E64]">No encontramos este pedido.</p>
        <Link
          href="/catalogo"
          className="rounded-xl bg-[#2D7A2D] px-5 py-3 font-semibold text-white"
        >
          Ir al catálogo
        </Link>
      </div>
    )
  }

  const o = data.order as unknown as {
    id: string
    order_number: string
    status: OrderStatus
    total: number | string
    subtotal: number | string
    created_at: string
    warehouses:
      | { name: string; municipality: string }
      | { name: string; municipality: string }[]
      | null
  }

  const initialPayload = {
    order: {
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      total: o.total,
      subtotal: o.subtotal,
      created_at: o.created_at,
    },
  }

  const whRaw = Array.isArray(o.warehouses) ? o.warehouses[0] : o.warehouses
  const almacenNombre = whRaw?.name ?? null
  const almacenMunicipio = whRaw?.municipality ?? null

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-6">
      <div className="mx-auto max-w-lg">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4E8D4]">
            <CheckCircle2 size={36} className="text-[#2D7A2D]" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#252320]">¡Pedido enviado!</h1>
          <p className="text-sm text-[#736E64]">
            Te avisamos por WhatsApp cuando el almacén confirme.
          </p>
        </div>

        <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)]">
          <p className="text-sm text-[#736E64]">Número de pedido</p>
          <p className="mt-0.5 font-mono text-2xl font-bold text-[#2D7A2D]">
            {o.order_number}
          </p>
          <p className="mt-1 text-xs text-[#A39E94]">
            {formatFecha(o.created_at)}
          </p>
          {almacenNombre ? (
            <p className="mt-2 text-sm text-[#524E46]">
              {almacenNombre}
              {almacenMunicipio ? ` · ${almacenMunicipio}` : ''}
            </p>
          ) : null}
          {data.items && data.items.length > 0 ? (
            <p className="mt-1 text-sm text-[#524E46]">
              {data.items.length} producto{data.items.length !== 1 ? 's' : ''} ·{' '}
              <span className="tabular-nums font-semibold text-[#2D7A2D]">
                {formatCOP(Number(o.subtotal))}
              </span>
            </p>
          ) : null}
        </div>

        <PedidoEstadoRealtime orderId={o.id} initial={initialPayload} />

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/catalogo"
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#2D7A2D] text-base font-semibold text-white hover:bg-[#236023]"
          >
            <ShoppingBag size={18} aria-hidden />
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
