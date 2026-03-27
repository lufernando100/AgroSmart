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
  searchParams: Promise<{ id?: string; ids?: string }>
}

function parseOrderIds(sp: { id?: string; ids?: string }): string[] {
  if (typeof sp.ids === 'string' && sp.ids.trim()) {
    return sp.ids
      .split(',')
      .map((s) => s.trim())
      .filter((s) => isUuid(s))
  }
  if (typeof sp.id === 'string' && isUuid(sp.id)) {
    return [sp.id]
  }
  return []
}

export default async function PedidoConfirmacionPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const orderIds = parseOrderIds(sp)

  if (orderIds.length === 0) {
    redirect('/catalogo')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    const next =
      orderIds.length === 1
        ? `/catalogo/pedido/confirmacion?id=${orderIds[0]}`
        : `/catalogo/pedido/confirmacion?ids=${encodeURIComponent(orderIds.join(','))}`
    redirect(`/login?next=${encodeURIComponent(next)}`)
  }

  const role = user.user_metadata?.role as string | undefined

  const loaded: Array<{
    id: string
    order_number: string
    status: OrderStatus
    subtotal: number | string
    total: number | string
    created_at: string
    almacenNombre: string | null
    almacenMunicipio: string | null
    itemCount: number
    initialPayload: {
      order: {
        id: string
        order_number: string
        status: OrderStatus
        total: number | string
        subtotal: number | string
        created_at: string
      }
    }
  }> = []

  for (const oid of orderIds) {
    const data = await getOrderForUser(oid, user.id, role)
    if (!data) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAF7F2] px-4 text-center">
          <p className="text-[#7B675B]">No encontramos uno o más pedidos.</p>
          <Link
            href="/catalogo"
            className="rounded-xl bg-[#059669] px-5 py-3 font-semibold text-white"
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

    const whRaw = Array.isArray(o.warehouses) ? o.warehouses[0] : o.warehouses
    const meta =
      data.order &&
      typeof data.order === 'object' &&
      'metadata' in data.order &&
      data.order.metadata !== undefined &&
      data.order.metadata !== null &&
      typeof data.order.metadata === 'object'
        ? (data.order.metadata as Record<string, unknown>)
        : undefined

    const initialPayload = {
      order: {
        id: o.id,
        order_number: o.order_number,
        status: o.status,
        total: o.total,
        subtotal: o.subtotal,
        created_at: o.created_at,
        metadata: meta,
      },
    }

    loaded.push({
      id: o.id,
      order_number: o.order_number,
      status: o.status,
      subtotal: o.subtotal,
      total: o.total,
      created_at: o.created_at,
      almacenNombre: whRaw?.name ?? null,
      almacenMunicipio: whRaw?.municipality ?? null,
      itemCount: data.items?.length ?? 0,
      initialPayload,
    })
  }

  const plural = loaded.length > 1

  return (
    <div className="min-h-screen bg-[#FAF7F2] px-4 py-6">
      <div className="mx-auto max-w-lg">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D1FAE5]">
            <CheckCircle2 size={36} className="text-[#059669]" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#1A0F0A]">
            {plural ? '¡Pedidos enviados!' : '¡Pedido enviado!'}
          </h1>
          <p className="text-sm text-[#7B675B]">
            {plural
              ? 'Te avisamos por WhatsApp cuando cada almacén confirme, si el servicio está activo. También podés ver el estado abajo o volver más tarde: se actualiza solo.'
              : 'Te avisamos por WhatsApp cuando el almacén confirme, si el servicio está activo. También podés ver el estado abajo o volver más tarde: se actualiza solo.'}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {loaded.map((row) => (
            <div key={row.id}>
              <div className="rounded-xl border border-[#EAE1D9] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)]">
                <p className="text-sm text-[#7B675B]">Número de pedido</p>
                <p className="mt-0.5 font-mono text-2xl font-bold text-[#059669]">
                  {row.order_number}
                </p>
                <p className="mt-1 text-xs text-[#9C8F85]">
                  {formatFecha(row.created_at)}
                </p>
                {row.almacenNombre ? (
                  <p className="mt-2 text-sm text-[#5B473D]">
                    {row.almacenNombre}
                    {row.almacenMunicipio ? ` · ${row.almacenMunicipio}` : ''}
                  </p>
                ) : null}
                {row.itemCount > 0 ? (
                  <p className="mt-1 text-sm text-[#5B473D]">
                    {row.itemCount} producto{row.itemCount !== 1 ? 's' : ''} ·{' '}
                    <span className="tabular-nums font-semibold text-[#059669]">
                      {formatCOP(Number(row.subtotal))}
                    </span>
                  </p>
                ) : null}
              </div>

              <PedidoEstadoRealtime
                orderId={row.id}
                initial={row.initialPayload}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/catalogo"
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#059669] text-base font-semibold text-white hover:bg-[#047857]"
          >
            <ShoppingBag size={18} aria-hidden />
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
