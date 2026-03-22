'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, PackageSearch, Leaf } from 'lucide-react'

const NAV = [
  { href: '/almacen/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/almacen/pedidos', label: 'Pedidos', Icon: ClipboardList },
  { href: '/almacen/productos', label: 'Productos', Icon: PackageSearch },
] as const

export default function AlmacenLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-[#FAFAF8]">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-[#E8E4DD] bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-[#E8E4DD] px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D7A2D]">
            <Leaf size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-[#252320]">GranoVivo</span>
            <p className="text-xs text-[#A39E94] leading-none">Panel almacén</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 p-3 pt-4" aria-label="Navegación del almacén">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#F0F7F0] text-[#2D7A2D]'
                    : 'text-[#524E46] hover:bg-[#F5F3EF] hover:text-[#252320]'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#E8E4DD] px-4 py-3">
          <p className="text-xs text-[#A39E94]">GranoVivo · Almacenes</p>
        </div>
      </aside>

      {/* ── Contenido ────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  )
}
