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
  /** Initial search query pre-filled from ?q= URL parameter */
  initialSearch?: string
  /** Best price per product keyed by product id (used for QuickAdd) */
  bestPricesByProduct?: Record<
    string,
    { warehouse_id: string; warehouse_name: string; price: number }
  >
}

const PLACEHOLDER_COLORS = [
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#F0E6D6', text: '#6F5410' },
  { bg: '#2D1B14', text: '#3D2F28' },
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
  initialSearch = '',
  bestPricesByProduct = {},
}: Props) {
  const [search, setSearch] = useState(initialSearch)
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
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9C8F85]"
          aria-hidden
        />
        <input
          type="search"
          inputMode="search"
          placeholder="Buscar fertilizante, herbicida…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar productos"
          className="w-full rounded-2xl border border-[#EAE1D9] bg-white py-3 pl-10 pr-4 text-base text-[#1A0F0A] shadow-[0_1px_3px_rgba(18,17,16,0.06)] placeholder-[#9C8F85] outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-shadow"
        />
      </div>

      <div className="mb-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          aria-pressed={!activeCategory}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
            !activeCategory
              ? 'bg-[#059669] text-white shadow-md shadow-[#059669]/25'
              : 'bg-white text-[#5B473D] border border-[#EAE1D9] hover:border-[#059669]/40'
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
                ? 'bg-[#059669] text-white shadow-md shadow-[#059669]/25'
                : 'bg-white text-[#5B473D] border border-[#EAE1D9] hover:border-[#059669]/40'
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
                <div className="group relative overflow-hidden rounded-2xl border border-[#EAE1D9] bg-white shadow-[0_1px_3px_rgba(18,17,16,0.06)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(18,17,16,0.10)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_1px_3px_rgba(18,17,16,0.06)]">
                  <Link
                    href={`/catalogo/${p.id}`}
                    className="flex items-center gap-3 p-4 pr-3"
                  >
                    <FotoProducto photo_url={p.photo_url} name={p.name} index={i} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#1A0F0A] leading-snug">
                        {p.name}
                      </p>
                      <p className="truncate text-sm text-[#7B675B]">
                        {[p.presentation, p.unit_of_measure].filter(Boolean).join(' · ')}
                      </p>
                      {p.category_name ? (
                        <p className="mt-0.5 text-xs text-[#9C8F85]">{p.category_name}</p>
                      ) : null}
                      <div className="mt-1.5 flex items-baseline gap-1.5">
                        <span className="tabular-nums text-base font-bold text-[#059669]">
                          Desde {formatCOP(p.price_from)}
                        </span>
                        <span className="text-xs text-[#7B675B]">
                          · {p.warehouse_count} almacén{p.warehouse_count !== 1 ? 'es' : ''}
                        </span>
                      </div>
                      {p.min_distance_km != null ? (
                        <p className="text-xs text-[#9C8F85]">
                          a {formatKm(p.min_distance_km)}
                        </p>
                      ) : null}
                    </div>

                    <ChevronRight
                      size={16}
                      className="shrink-0 text-[#2D1B14] transition-transform group-hover:translate-x-0.5"
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
