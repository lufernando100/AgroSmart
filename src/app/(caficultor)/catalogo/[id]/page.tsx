import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ChevronLeft, Store, MapPin, Award } from 'lucide-react'
import { getProductoDetalle } from '@/lib/catalogo/queries'
import { isUuid } from '@/lib/catalogo/uuid'
import { formatCOP } from '@/lib/utils/format'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProductoDetallePage({ params }: PageProps) {
  const { id } = await params
  if (!isUuid(id)) notFound()

  const producto = await getProductoDetalle(id)
  if (!producto) notFound()

  const precioMin = producto.precios[0]?.precio_unitario ?? null
  const precioMax = producto.precios.at(-1)?.precio_unitario ?? null

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#E8E4DD] bg-[#FAFAF8] px-4 py-3">
        <Link
          href="/catalogo"
          aria-label="Volver al catálogo"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3EF] text-[#524E46]"
        >
          <ChevronLeft size={20} aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-[#736E64]">
            {producto.categoria_nombre ?? 'Producto'}
          </p>
          <h1 className="truncate text-lg font-bold text-[#252320]">
            {producto.nombre}
          </h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {/* Foto del producto (si existe) */}
        {producto.foto_url ? (
          <div className="relative mb-4 h-52 w-full overflow-hidden rounded-2xl border border-[#E8E4DD] bg-[#F5F3EF]">
            <Image
              src={producto.foto_url}
              alt={producto.nombre}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              className="object-contain p-2"
              priority
            />
          </div>
        ) : null}

        {/* Info del producto */}
        <div className="rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)]">
          {producto.nombre_corto ? (
            <p className="text-sm font-medium text-[#524E46]">
              {producto.nombre_corto}
              {producto.marca ? ` · ${producto.marca}` : ''}
            </p>
          ) : null}

          {producto.presentacion ? (
            <p className="mt-1 text-sm text-[#736E64]">
              {producto.presentacion}
              {producto.peso_kg != null ? ` · ${producto.peso_kg} kg` : ''}{' '}
              · {producto.unidad_medida}
            </p>
          ) : null}

          {producto.composicion && Object.keys(producto.composicion).length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(producto.composicion).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full bg-[#D4E8D4] px-2.5 py-0.5 text-xs font-semibold text-[#1A481A]"
                >
                  {k} {v}%
                </span>
              ))}
            </div>
          ) : null}

          {precioMin != null ? (
            <div className="mt-4 flex items-end gap-2">
              <span className="tabular-nums text-3xl font-bold text-[#2D7A2D]">
                {formatCOP(precioMin)}
              </span>
              {precioMax != null && precioMax !== precioMin ? (
                <span className="mb-1 text-sm text-[#A39E94]">
                  — {formatCOP(precioMax)}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Comparador de precios */}
        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold text-[#252320]">
            Comparar precios — {producto.precios.length} almacén{producto.precios.length !== 1 ? 'es' : ''}
          </h2>

          {producto.precios.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-[#E8E4DD] bg-white p-8 text-center">
              <Store size={36} className="text-[#D4CEC4]" strokeWidth={1.5} />
              <p className="text-sm text-[#736E64]">
                No hay precios disponibles en este momento.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {producto.precios.map((pr, i) => {
                const esMejor = i === 0
                return (
                  <li
                    key={pr.precio_id}
                    className={`rounded-xl border p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)] ${
                      esMejor
                        ? 'border-[#2D7A2D]/40 bg-[#F0F7F0]'
                        : 'border-[#E8E4DD] bg-white'
                    }`}
                    style={esMejor ? { borderLeftWidth: '3px', borderLeftColor: '#2D7A2D' } : undefined}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#252320]">
                            {pr.almacen_nombre}
                          </p>
                          {esMejor ? (
                            <span className="flex items-center gap-1 rounded-full bg-[#2D7A2D] px-2 py-0.5 text-xs font-bold text-white">
                              <Award size={10} aria-hidden /> Mejor precio
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-[#736E64]">
                          <MapPin size={12} aria-hidden />
                          {pr.municipio}, {pr.departamento}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p
                          className={`tabular-nums text-xl font-bold ${
                            esMejor ? 'text-[#2D7A2D]' : 'text-[#524E46]'
                          }`}
                        >
                          {formatCOP(pr.precio_unitario)}
                        </p>
                        {precioMin != null && pr.precio_unitario > precioMin ? (
                          <p className="text-xs text-[#A39E94]">
                            +{formatCOP(pr.precio_unitario - precioMin)} vs mejor
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <Link
                      href={`/catalogo/pedido?producto_id=${producto.id}&almacen_id=${pr.almacen_id}`}
                      className="mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-[#2D7A2D] text-base font-semibold text-white hover:bg-[#236023]"
                    >
                      Pedir aquí
                    </Link>
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
