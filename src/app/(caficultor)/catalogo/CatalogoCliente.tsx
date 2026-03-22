'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { formatCOP, formatKm } from '@/lib/utils/format'
import { MensajeVacio } from '@/components/ui/MensajeVacio'
import type { ProductoListado } from '@/lib/catalogo/queries'

type Props = {
  categorias: { id: string; nombre: string; orden: number }[]
  productos: ProductoListado[]
  categoriaIdActiva: string | null
}

/** Colores de fondo para el placeholder cuando no hay foto, por posición en el listado. */
const PLACEHOLDER_COLORS = [
  { bg: '#D4E8D4', text: '#1A481A' },
  { bg: '#F0E6D6', text: '#6F5410' },
  { bg: '#D4CEC4', text: '#3A3732' },
  { bg: '#D4E8D4', text: '#236023' },
]

function FotoProducto({
  foto_url,
  nombre,
  index,
}: {
  foto_url: string | null
  nombre: string
  index: number
}) {
  const color = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]
  const inicial = nombre.charAt(0).toUpperCase()

  if (foto_url) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={foto_url}
          alt={nombre}
          fill
          sizes="56px"
          className="object-cover"
          onError={(e) => {
            // Si la imagen falla, mostrar el placeholder
            const target = e.currentTarget as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              parent.style.backgroundColor = color.bg
              parent.textContent = inicial
              parent.style.color = color.text
              parent.style.display = 'flex'
              parent.style.alignItems = 'center'
              parent.style.justifyContent = 'center'
              parent.style.fontSize = '1.25rem'
              parent.style.fontWeight = '700'
            }
          }}
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

export function CatalogoCliente({ categorias, productos, categoriaIdActiva }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [catActiva, setCatActiva] = useState<string | null>(categoriaIdActiva)

  const productosFiltrados = useMemo(() => {
    let lista = productos
    if (catActiva) {
      lista = lista.filter((p) => p.categoria_id === catActiva)
    }
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase()
      lista = lista.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.nombre_corto ?? '').toLowerCase().includes(q) ||
          (p.presentacion ?? '').toLowerCase().includes(q)
      )
    }
    return lista
  }, [productos, catActiva, busqueda])

  return (
    <>
      {/* Buscador */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E94]"
          aria-hidden
        />
        <input
          type="search"
          inputMode="search"
          placeholder="Buscar fertilizante, herbicida…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          aria-label="Buscar productos"
          className="w-full rounded-full border border-[#E8E4DD] bg-[#F5F3EF] py-3 pl-10 pr-4 text-base text-[#252320] placeholder-[#A39E94] outline-none focus:border-[#2D7A2D] focus:ring-2 focus:ring-[#2D7A2D]/20"
        />
      </div>

      {/* Chips de categorías */}
      <div className="mb-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <button
          type="button"
          onClick={() => setCatActiva(null)}
          aria-pressed={!catActiva}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            !catActiva
              ? 'bg-[#2D7A2D] text-white'
              : 'bg-[#F5F3EF] text-[#524E46] hover:bg-[#E8E4DD]'
          }`}
        >
          Todos
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCatActiva(catActiva === c.id ? null : c.id)}
            aria-pressed={catActiva === c.id}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              catActiva === c.id
                ? 'bg-[#2D7A2D] text-white'
                : 'bg-[#F5F3EF] text-[#524E46] hover:bg-[#E8E4DD]'
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {productosFiltrados.length === 0 ? (
        <MensajeVacio
          Icono={Search}
          titulo={busqueda ? `Sin resultados para "${busqueda}"` : 'Sin productos en esta categoría'}
          descripcion="Intenta con otro nombre o revisa el catálogo completo."
          accion={{
            label: 'Ver todo el catálogo',
            onClick: () => { setBusqueda(''); setCatActiva(null) },
          }}
          className="pb-4"
        />
      ) : (
        <ul className="flex flex-col gap-3 pb-4">
          {productosFiltrados.map((p, i) => (
            <li key={p.id}>
              <Link
                href={`/catalogo/${p.id}`}
                className="flex items-center gap-3 rounded-xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_2px_rgba(18,17,16,0.06)] hover:border-[#2D7A2D]/40 hover:shadow-[0_2px_8px_rgba(18,17,16,0.08)]"
              >
                <FotoProducto foto_url={p.foto_url} nombre={p.nombre} index={i} />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#252320]">{p.nombre}</p>
                  <p className="truncate text-sm text-[#736E64]">
                    {[p.presentacion, p.unidad_medida].filter(Boolean).join(' · ')}
                  </p>
                  {p.categoria_nombre ? (
                    <p className="mt-0.5 text-xs text-[#A39E94]">{p.categoria_nombre}</p>
                  ) : null}
                </div>

                <div className="shrink-0 text-right">
                  <p className="tabular-nums font-bold text-[#2D7A2D]">
                    Desde {formatCOP(p.precio_desde)}
                  </p>
                  <p className="text-xs text-[#736E64]">
                    {p.almacenes_count} almacén{p.almacenes_count !== 1 ? 'es' : ''}
                  </p>
                  {p.distancia_km_min != null ? (
                    <p className="text-xs text-[#A39E94]">
                      a {formatKm(p.distancia_km_min)}
                    </p>
                  ) : null}
                </div>

                <ChevronRight size={16} className="shrink-0 text-[#A39E94]" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
