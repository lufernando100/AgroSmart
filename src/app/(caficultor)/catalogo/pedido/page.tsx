import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getProductoDetalle } from '@/lib/catalogo/queries'
import { isUuid } from '@/lib/catalogo/uuid'
import { PedidoForm } from './PedidoForm'

type PageProps = {
  searchParams: Promise<{ producto_id?: string; almacen_id?: string }>
}

export default async function PedidoPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const productoId = sp.producto_id
  const almacenId = sp.almacen_id

  if (!productoId || !almacenId || !isUuid(productoId) || !isUuid(almacenId)) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] px-4 py-6">
        <p className="text-[#736E64]">
          Abre un producto en el catálogo y elige &quot;Pedir aquí&quot; en un almacén.
        </p>
        <Link
          href="/catalogo"
          className="mt-4 inline-block rounded-xl bg-[#2D7A2D] px-5 py-3 font-semibold text-white"
        >
          Ir al catálogo
        </Link>
      </div>
    )
  }

  const producto = await getProductoDetalle(productoId)
  if (!producto) notFound()

  const linea = producto.precios.find((p) => p.almacen_id === almacenId)
  if (!linea) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] px-4 py-6">
        <p className="text-[#736E64]">
          Este almacén no tiene precio activo para este producto.
        </p>
        <Link
          href={`/catalogo/${productoId}`}
          className="mt-4 inline-block text-[#2D7A2D] underline"
        >
          Volver al producto
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#E8E4DD] bg-[#FAFAF8] px-4 py-3">
        <Link
          href={`/catalogo/${productoId}`}
          aria-label="Volver al producto"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3EF] text-[#524E46]"
        >
          <ChevronLeft size={20} aria-hidden />
        </Link>
        <div>
          <p className="text-xs text-[#736E64]">{linea.almacen_nombre}</p>
          <h1 className="text-lg font-bold text-[#252320]">Tu pedido</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        <PedidoForm
          productoId={producto.id}
          almacenId={linea.almacen_id}
          productoNombre={producto.nombre}
          almacenNombre={linea.almacen_nombre}
          precioUnitario={linea.precio_unitario}
          presentacion={producto.presentacion}
          unidadMedida={producto.unidad_medida}
        />
      </div>
    </div>
  )
}
