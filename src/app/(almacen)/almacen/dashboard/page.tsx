import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { warehouseDashboardSummary } from '@/lib/pedidos/service'
import { ClipboardList, PackageSearch, TrendingUp } from 'lucide-react'
import { formatCOP } from '@/lib/utils/format'

export default async function AlmacenDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const res = await warehouseDashboardSummary(user.id)

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold text-[#252320]">Dashboard</h1>
      <p className="mt-1 text-sm text-[#736E64]">Resumen de hoy y accesos rápidos</p>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/almacen/pedidos"
          className="group rounded-2xl border border-[#E8E4DD] bg-white p-5 shadow-[0_1px_3px_rgba(18,17,16,0.06)] transition-all hover:shadow-[0_4px_12px_rgba(18,17,16,0.09)] hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#736E64]">Pedidos pendientes</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF6EC]">
              <ClipboardList size={18} className="text-[#8B6914]" strokeWidth={1.75} />
            </div>
          </div>
          <p className="mt-3 text-4xl font-bold text-[#252320]">{res.pending}</p>
          <p className="mt-2 text-sm font-semibold text-[#2D7A2D] group-hover:underline">
            Ver pedidos →
          </p>
        </Link>

        <div className="rounded-2xl border border-[#E8E4DD] bg-white p-5 shadow-[0_1px_3px_rgba(18,17,16,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#736E64]">Ingresos confirmados hoy</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F0F7F0]">
              <TrendingUp size={18} className="text-[#2D7A2D]" strokeWidth={1.75} />
            </div>
          </div>
          <p className="mt-3 tabular-nums text-3xl font-bold text-[#252320]">
            {formatCOP(res.revenueToday)}
          </p>
          <p className="mt-2 text-xs text-[#A39E94]">
            Suma de pedidos confirmados hoy
          </p>
        </div>
      </div>

      {/* Acceso rápido a productos */}
      <div className="mt-5">
        <Link
          href="/almacen/productos"
          className="flex items-center gap-3 rounded-2xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)] transition-all hover:border-[#2D7A2D]/40 hover:shadow-[0_4px_12px_rgba(18,17,16,0.09)]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3EF]">
            <PackageSearch size={20} className="text-[#524E46]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-semibold text-[#252320]">Gestionar precios y disponibilidad</p>
            <p className="text-sm text-[#736E64]">Edita precios o marca productos como agotados</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
