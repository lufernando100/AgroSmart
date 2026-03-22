import { Suspense } from 'react'
import {
  listActiveCategories,
  listProductSummaries,
  listBestPricesByProduct,
  parseSectorQuery,
} from '@/lib/catalogo/queries'
import { isUuid } from '@/lib/catalogo/uuid'
import { CatalogoCliente } from './CatalogoCliente'

type PageProps = {
  searchParams: Promise<{ categoria_id?: string; sector?: string; q?: string }>
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const sector = parseSectorQuery(sp.sector ?? null)
  const categoriaId =
    sp.categoria_id && isUuid(sp.categoria_id) ? sp.categoria_id : undefined

  const [categorias, productos, preciosPorProducto] = await Promise.all([
    listActiveCategories(),
    listProductSummaries({ sector, categoryId: categoriaId }),
    listBestPricesByProduct(),
  ])

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-[#E8E4DD] bg-[#FAFAF8] px-4 py-3">
        <h1 className="text-xl font-bold text-[#252320]">Catálogo</h1>
        <p className="text-sm text-[#736E64]">
          {productos.length} producto{productos.length !== 1 ? 's' : ''} disponible{productos.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="px-4 pt-4">
        <Suspense>
          <CatalogoCliente
            categorias={categorias}
            productos={productos}
            categoriaIdActiva={categoriaId ?? null}
            preciosPorProducto={preciosPorProducto}
          />
        </Suspense>
      </div>
    </div>
  )
}
