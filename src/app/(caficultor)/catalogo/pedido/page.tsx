import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { getProductDetail } from '@/lib/catalogo/queries'
import { isUuid } from '@/lib/catalogo/uuid'
import { PedidoForm } from './PedidoForm'

type PageProps = {
  searchParams: Promise<{ producto_id?: string; almacen_id?: string }>
}

export default async function PedidoPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const productId = sp.producto_id
  const warehouseId = sp.almacen_id

  if (!productId || !warehouseId || !isUuid(productId) || !isUuid(warehouseId)) {
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

  const product = await getProductDetail(productId)
  if (!product) notFound()

  const line = product.prices.find((p) => p.warehouse_id === warehouseId)
  if (!line) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] px-4 py-6">
        <p className="text-[#736E64]">
          Este almacén no tiene precio activo para este producto.
        </p>
        <Link
          href={`/catalogo/${productId}`}
          className="mt-4 inline-block text-[#2D7A2D] underline"
        >
          Volver al producto
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#E8E4DD] bg-[#FAFAF8] px-4 py-3">
        <Link
          href={`/catalogo/${productId}`}
          aria-label="Volver al producto"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F5F3EF] text-[#524E46]"
        >
          <ChevronLeft size={20} aria-hidden />
        </Link>
        <div>
          <p className="text-xs text-[#736E64]">{line.warehouse_name}</p>
          <h1 className="text-lg font-bold text-[#252320]">Tu pedido</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        <PedidoForm
          productId={product.id}
          warehouseId={line.warehouse_id}
          productName={product.name}
          warehouseName={line.warehouse_name}
          unitPrice={line.unit_price}
          presentation={product.presentation}
          unitOfMeasure={product.unit_of_measure}
        />
      </div>
    </div>
  )
}
