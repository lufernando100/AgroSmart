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
  const categoryId =
    sp.categoria_id && isUuid(sp.categoria_id) ? sp.categoria_id : undefined

  const [categories, products, bestPricesByProduct] = await Promise.all([
    listActiveCategories(),
    listProductSummaries({ sector, categoryId }),
    listBestPricesByProduct(),
  ])

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Sticky header with product count */}
      <header className="sticky top-0 z-30 border-b border-[#EAE1D9] bg-[#FAF7F2] px-4 py-3">
        <h1 className="text-xl font-bold text-[#1A0F0A]">Catálogo</h1>
        <p className="text-sm text-[#7B675B]">
          {products.length} producto{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}
        </p>
      </header>

      <div className="px-4 pt-4">
        <Suspense>
          <CatalogoCliente
            categories={categories}
            products={products}
            activeCategoryId={categoryId ?? null}
            bestPricesByProduct={bestPricesByProduct}
          />
        </Suspense>
      </div>
    </div>
  )
}
