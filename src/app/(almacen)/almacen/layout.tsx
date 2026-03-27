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
    <div className="flex min-h-screen bg-[#FAF7F2]">
      {/* ── Sidebar Desktop (md+) ────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:border-[#EAE1D9] md:bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-[#EAE1D9] px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#059669]">
            <Leaf size={16} className="text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-[#1A0F0A]">GranoVivo</span>
            <p className="text-xs text-[#9C8F85] leading-none">Panel almacén</p>
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
                    ? 'bg-[#ECFDF5] text-[#059669]'
                    : 'text-[#5B473D] hover:bg-[#FDFBF7] hover:text-[#1A0F0A]'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.75} aria-hidden />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#EAE1D9] px-4 py-3">
          <p className="text-xs text-[#9C8F85]">GranoVivo · Almacenes</p>
        </div>
      </aside>

      {/* ── Contenido ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        <main className="flex-1 pb-20 md:pb-0">
          <div className="mx-auto max-w-4xl">
            {children}
          </div>
        </main>
      </div>

      {/* ── TAB BAR MOBILE (solo < md) ────────────────────────────────────── */}
      <nav
        aria-label="Navegación principal"
        className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-[#2D1B14] bg-[#1A0F0A] shadow-[0_-1px_8px_rgba(18,17,16,0.3)] md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 py-2 ${
                active ? 'text-white' : 'text-white/70'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} aria-hidden />
              <span className="truncate text-[11px] font-semibold leading-tight">
                {label}
              </span>
              <span 
                className={`mt-0.5 h-1 w-1 rounded-full bg-[#D97706] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`} 
              />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
