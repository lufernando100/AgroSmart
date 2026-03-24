'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { ShoppingCart } from 'lucide-react'
import { cartItemCount, useCartStore } from '@/lib/cart/store'

let clientHydrated = false

function subscribeClientReady(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  queueMicrotask(() => {
    clientHydrated = true
    onStoreChange()
  })
  return () => {}
}

function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeClientReady,
    () => clientHydrated,
    () => false
  )
}

export function SidebarCartLink() {
  const pathname = usePathname()
  const lines = useCartStore((s) => s.lines)
  const isClient = useIsClient()
  const n = cartItemCount(lines)
  const active = pathname.startsWith('/carrito')

  return (
    <Link
      href="/carrito"
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? 'bg-[#ECFDF5] text-[#059669]'
          : 'text-[#5B473D] hover:bg-[#FDFBF7] hover:text-[#1A0F0A]'
      }`}
    >
      <span className="relative inline-flex">
        <ShoppingCart
          size={20}
          strokeWidth={active ? 2.5 : 1.75}
          aria-hidden
        />
        {isClient && n > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C23B22] px-1 text-[10px] font-bold text-white">
            {n > 99 ? '99+' : n}
          </span>
        ) : null}
      </span>
      Carrito
    </Link>
  )
}

/** Mobile: floating shortcut when the cart has items (above the tab bar). */
export function FloatingCartButton() {
  const lines = useCartStore((s) => s.lines)
  const isClient = useIsClient()
  const n = cartItemCount(lines)

  if (!isClient || n === 0) return null

  return (
    <Link
      href="/carrito"
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#059669] text-white shadow-lg shadow-[#059669]/30 md:hidden"
      aria-label={`Carrito, ${n} productos`}
    >
      <span className="relative">
        <ShoppingCart size={24} strokeWidth={2} aria-hidden />
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#059669]">
          {n > 99 ? '99+' : n}
        </span>
      </span>
    </Link>
  )
}
