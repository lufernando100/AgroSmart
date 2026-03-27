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
      <h1 className="text-2xl font-bold text-[#1A0F0A]">Dashboard</h1>
      <p className="mt-1 text-sm text-[#7B675B]">Resumen de hoy y accesos rápidos</p>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/almacen/pedidos"
          className="group rounded-[2.5rem] border-2 border-[#1A0F0A]/10 bg-white p-6 shadow-xl transition-all hover:-translate-y-1 active:scale-95"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#7B675B]">Pedidos pendientes</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDF6EC]">
              <ClipboardList size={20} className="text-[#D97706]" strokeWidth={2} />
            </div>
          </div>
          <p className="mt-4 text-4xl font-bold text-[#1A0F0A]">{res.pending}</p>
          <p className="mt-3 text-sm font-semibold text-[#059669] group-hover:underline">
            Ver pedidos →
          </p>
        </Link>

        <div className="rounded-[2.5rem] border-2 border-[#1A0F0A]/10 bg-white p-6 shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#7B675B]">Ingresos confirmados hoy</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ECFDF5]">
              <TrendingUp size={20} className="text-[#059669]" strokeWidth={2} />
            </div>
          </div>
          <p className="mt-4 tabular-nums text-3xl font-bold text-[#1A0F0A]">
            {formatCOP(res.revenueToday)}
          </p>
          <p className="mt-3 text-xs text-[#9C8F85]">
            Suma de pedidos confirmados hoy
          </p>
        </div>
      </div>

      {/* Acceso rápido a productos */}
      <div className="mt-5">
        <Link
          href="/almacen/productos"
          className="flex items-center gap-4 rounded-[2.5rem] border-2 border-[#1A0F0A]/10 bg-white p-5 shadow-xl transition-all hover:border-[#059669]/40 active:scale-95 hover:-translate-y-1"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDFBF7]">
            <PackageSearch size={24} className="text-[#5B473D]" strokeWidth={2} />
          </div>
          <div>
            <p className="font-semibold text-[#1A0F0A]">Gestionar precios y disponibilidad</p>
            <p className="text-sm text-[#7B675B]">Edita precios o marca productos como agotados</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
