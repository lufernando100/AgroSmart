'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { formatCOP, formatKm } from '@/lib/utils/format'
import { MensajeVacio } from '@/components/ui/MensajeVacio'
import { QuickAdd } from '@/components/catalogo/QuickAdd'
import type { ProductSummary } from '@/lib/catalogo/queries'

type Props = {
  categories: { id: string; name: string; sort_order: number }[]
  products: ProductSummary[]
  activeCategoryId: string | null
  /** Best price per product keyed by product id (used for QuickAdd) */
  bestPricesByProduct?: Record<
    string,
    { warehouse_id: string; warehouse_name: string; price: number }
  >
}

const PLACEHOLDER_COLORS = [
  { bg: '#D4E8D4', text: '#1A481A' },
  { bg: '#F0E6D6', text: '#6F5410' },
  { bg: '#D4CEC4', text: '#3A3732' },
  { bg: '#C9A87A22', text: '#53400C' },
]

function FotoProducto({
  photo_url,
  name,
  index,
}: {
  photo_url: string | null
  name: string
  index: number
}) {
  const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]
  const inicial = name.charAt(0).toUpperCase()

  if (photo_url) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={photo_url}
          alt={name}
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-bold"
      style={{ backgroundColor: color.bg, color: color.text }}
      aria-hidden
    >
      {inicial}
    </div>
  )
}

export function CatalogoCliente({
  categories,
  products,
  activeCategoryId,
  bestPricesByProduct = {},
}: Props) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(activeCategoryId)

  const filteredProducts = useMemo(() => {
    let list = products
    if (activeCategory) {
      list = list.filter((p) => p.category_id === activeCategory)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.short_name ?? '').toLowerCase().includes(q) ||
          (p.presentation ?? '').toLowerCase().includes(q)
      )
    }
    return list
  }, [products, activeCategory, search])

  return (
    <>
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39E94]"
          aria-hidden
        />
        <input
          type="search"
          inputMode="search"
          placeholder="Buscar fertilizante, herbicida…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar productos"
          className="w-full rounded-2xl border border-[#E8E4DD] bg-white py-3 pl-10 pr-4 text-base text-[#252320] shadow-[0_1px_3px_rgba(18,17,16,0.06)] placeholder-[#A39E94] outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/15 transition-shadow"
        />
      </div>

      <div className="mb-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          aria-pressed={!activeCategory}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
            !activeCategory
              ? 'bg-[#2D7A2D] text-white shadow-md shadow-[#2D7A2D]/25'
              : 'bg-white text-[#524E46] border border-[#E8E4DD] hover:border-[#2D7A2D]/40'
          }`}
        >
          Todos
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
            aria-pressed={activeCategory === c.id}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
              activeCategory === c.id
                ? 'bg-[#2D7A2D] text-white shadow-md shadow-[#2D7A2D]/25'
                : 'bg-white text-[#524E46] border border-[#E8E4DD] hover:border-[#2D7A2D]/40'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <MensajeVacio
          Icon={Search}
          title={search ? `Sin resultados para "${search}"` : 'Sin productos en esta categoría'}
          description="Intenta con otro nombre o revisa el catálogo completo."
          action={{
            label: 'Ver todo el catálogo',
            onClick: () => { setSearch(''); setActiveCategory(null) },
          }}
          className="pb-4"
        />
      ) : (
        <ul className="flex flex-col gap-3 pb-4">
          {filteredProducts.map((p, i) => {
            const bestPrice = bestPricesByProduct[p.id]
            return (
              <li key={p.id}>
                <div className="group relative overflow-hidden rounded-2xl border border-[#E8E4DD] bg-white shadow-[0_1px_3px_rgba(18,17,16,0.06)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(18,17,16,0.10)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_3px_rgba(18,17,16,0.06)]">
                  <Link
                    href={`/catalogo/${p.id}`}
                    className="flex items-center gap-3 p-4 pr-3"
                  >
                    <FotoProducto photo_url={p.photo_url} name={p.name} index={i} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#252320] leading-snug">
                        {p.name}
                      </p>
                      <p className="truncate text-sm text-[#736E64]">
                        {[p.presentation, p.unit_of_measure].filter(Boolean).join(' · ')}
                      </p>
                      {p.category_name ? (
                        <p className="mt-0.5 text-xs text-[#A39E94]">{p.category_name}</p>
                      ) : null}
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="tabular-nums text-base font-bold text-[#2D7A2D]">
                          Desde {formatCOP(p.price_from)}
                        </span>
                        <span className="text-xs text-[#736E64]">
                          · {p.warehouse_count} almacén{p.warehouse_count !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      {p.min_distance_km != null ? (
                        <p className="text-xs text-[#A39E94]">
                          a {formatKm(p.min_distance_km)}
                        </p>
                      ) : null}
                    </div>

                    <ChevronRight
                      size={16}
                      className="shrink-0 text-[#D4CEC4] transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>

                  {bestPrice ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <QuickAdd
                        productId={p.id}
                        warehouseId={bestPrice.warehouse_id}
                        warehouseName={bestPrice.warehouse_name}
                        unitPrice={bestPrice.price}
                        productName={p.name}
                        presentation={p.presentation}
                        unitOfMeasure={p.unit_of_measure}
                      />
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
