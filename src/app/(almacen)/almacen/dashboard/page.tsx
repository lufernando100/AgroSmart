import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { resumenDashboardAlmacen } from '@/lib/pedidos/service'

export default async function AlmacenDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const res = await resumenDashboardAlmacen(user.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Panel del almacén
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Resumen de hoy y accesos rápidos.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/almacen/pedidos"
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Pedidos pendientes
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-800 dark:text-emerald-400">
            {res.pendientes}
          </p>
          <p className="mt-2 text-sm text-emerald-700 underline dark:text-emerald-500">
            Ver pedidos →
          </p>
        </Link>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Ingresos confirmados hoy
          </p>
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {res.ingresosHoy.toLocaleString('es-CO', {
              style: 'currency',
              currency: 'COP',
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
            Suma de totales de pedidos confirmados hoy.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/almacen/productos"
          className="inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
        >
          Gestionar precios y disponibilidad
        </Link>
      </div>
    </div>
  )
}
