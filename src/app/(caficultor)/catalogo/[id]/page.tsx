import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronLeft, Store, MapPin, Award } from 'lucide-react'
import { getProductDetail } from '@/lib/catalogo/queries'
import { isUuid } from '@/lib/catalogo/uuid'
import { formatCOP } from '@/lib/utils/format'
import { ProductDetailWarehouseActions } from '@/components/catalogo/ProductDetailWarehouseActions'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const product = await getProductDetail(id)
  if (!product) notFound()

  const precioMin = product.prices[0]?.unit_price ?? null
  const precioMax = product.prices.at(-1)?.unit_price ?? null

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#EAE1D9] bg-[#FAF7F2] px-4 py-3">
        <Link
          href="/catalogo"
          aria-label="Volver al catálogo"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDFBF7] text-[#5B473D]"
        >
          <ChevronLeft size={20} aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-[#7B675B]">
            {product.category_name ?? 'Producto'}
          </p>
          <h1 className="truncate text-lg font-bold text-[#1A0F0A]">
            {product.name}
          </h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {product.photo_url ? (
          <div className="relative mb-4 h-52 w-full overflow-hidden rounded-2xl border border-[#EAE1D9] bg-[#FDFBF7]">
            <Image
              src={product.photo_url}
              alt={product.name}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-contain p-2"
              priority
            />
          </div>
        ) : null}

        <div className="rounded-xl border border-[#EAE1D9] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)]">
          {product.short_name ? (
            <p className="text-sm font-medium text-[#5B473D]">
              {product.short_name}
              {product.brand ? ` · ${product.brand}` : ''}
            </p>
          ) : null}

          {product.presentation ? (
            <p className="mt-1 text-sm text-[#7B675B]">
              {product.presentation}
              {product.weight_kg != null ? ` · ${product.weight_kg} kg` : ''}{' '}
              · {product.unit_of_measure}
            </p>
          ) : null}

          {product.composition && Object.keys(product.composition).length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(product.composition).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-semibold text-[#065F46]"
                >
                  {k} {v}%
                </span>
              ))}
            </div>
          ) : null}

          {precioMin != null ? (
            <div className="mt-4 flex items-end gap-2">
              <span className="tabular-nums text-3xl font-bold text-[#059669]">
                {formatCOP(precioMin)}
              </span>
              {precioMax != null && precioMax !== precioMin ? (
                <span className="mb-1 text-sm text-[#9C8F85]">
                  — {formatCOP(precioMax)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold text-[#1A0F0A]">
            Comparar precios — {product.prices.length} almacén{product.prices.length !== 1 ? 'es' : ''}
          </h2>

          {product.prices.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-[#EAE1D9] bg-white p-8 text-center">
              <Store size={36} className="text-[#2D1B14]" strokeWidth={1.5} />
              <p className="text-sm text-[#7B675B]">
                No hay precios disponibles en este momento.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {product.prices.map((pr, i) => {
                const esMejor = i === 0
                return (
                  <li
                    key={pr.price_id}
                    className={`rounded-xl border p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)] ${
                      esMejor
                        ? 'border-[#059669]/40 bg-[#ECFDF5]'
                        : 'border-[#EAE1D9] bg-white'
                    }`}
                    style={esMejor ? { borderLeftWidth: '3px', borderLeftColor: '#059669' } : undefined}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#1A0F0A]">
                            {pr.warehouse_name}
                          </p>
                          {esMejor ? (
                            <span className="flex items-center gap-1 rounded-full bg-[#059669] px-2 py-0.5 text-xs font-bold text-white">
                              <Award size={10} aria-hidden /> Mejor precio
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-[#7B675B]">
                          <MapPin size={12} aria-hidden />
                          {pr.municipality}, {pr.department}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`tabular-nums text-xl font-bold ${
                            esMejor ? 'text-[#059669]' : 'text-[#5B473D]'
                          }`}
                        >
                          {formatCOP(pr.unit_price)}
                        </p>
                        {precioMin != null && pr.unit_price > precioMin ? (
                          <p className="text-xs text-[#9C8F85]">
                            +{formatCOP(pr.unit_price - precioMin)} vs mejor
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <ProductDetailWarehouseActions
                      productId={product.id}
                      productName={product.name}
                      presentation={product.presentation}
                      unitOfMeasure={product.unit_of_measure}
                      warehouseId={pr.warehouse_id}
                      warehouseName={pr.warehouse_name}
                      unitPrice={pr.unit_price}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
