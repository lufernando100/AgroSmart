'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShoppingBag,
  MapPin,
  Wallet,
  MessageCircle,
  Home,
  Leaf,
} from 'lucide-react'
import {
  FloatingCartButton,
  SidebarCartLink,
} from '@/components/cart/CartChrome'

const TABS = [
  {
    href: '/inicio',
    label: 'Inicio',
    Icon: Home,
    match: (p: string) => p === '/inicio',
  },
  {
    href: '/catalogo',
    label: 'Catálogo',
    Icon: ShoppingBag,
    match: (p: string) => p.startsWith('/catalogo'),
  },
  {
    href: '/mi-finca',
    label: 'Mi Finca',
    Icon: MapPin,
    match: (p: string) => p.startsWith('/mi-finca'),
  },
  {
    href: '/mis-costos',
    label: 'Mis Costos',
    Icon: Wallet,
    match: (p: string) => p.startsWith('/mis-costos'),
  },
  {
    href: '/chat',
    label: 'Asistente',
    Icon: MessageCircle,
    match: (p: string) => p.startsWith('/chat'),
  },
] as const

export default function CaficultorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-dvh bg-[#FAFAF8]">

      {/* ── SIDEBAR DESKTOP (md+) ─────────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-56 md:shrink-0 md:flex-col md:border-r md:border-[#E8E4DD] md:bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[#E8E4DD]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D7A2D]">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-[#252320] tracking-tight">
            GranoVivo
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-1 p-3 pt-4" aria-label="Navegación principal">
          {TABS.map(({ href, label, Icon, match }) => {
            const active = match(pathname)
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
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.75}
                  aria-hidden
                />
                {label}
              </Link>
            )
          })}
          <SidebarCartLink />
        </nav>

        {/* Footer de sidebar */}
        <div className="border-t border-[#E8E4DD] px-4 py-3">
          <p className="text-xs text-[#A39E94]">GranoVivo · Caficultores</p>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* En mobile: padding-bottom para tab bar. En desktop: sin padding extra. */}
        <main className="flex-1 pb-20 md:pb-0">
          {/* Limitar ancho del contenido en desktop para mejor legibilidad */}
          <div className="mx-auto w-full max-w-2xl">
            {children}
          </div>
        </main>
      </div>

      {/* ── TAB BAR MOBILE (solo < md) ────────────────────────────────────── */}
      <FloatingCartButton />

      <nav
        aria-label="Navegación principal"
        className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-[#E8E4DD] bg-white shadow-[0_-1px_8px_rgba(18,17,16,0.06)] md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 ${
                active ? 'text-[#2D7A2D]' : 'text-[#A39E94]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} aria-hidden />
              <span className="truncate text-[11px] font-semibold leading-tight">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
