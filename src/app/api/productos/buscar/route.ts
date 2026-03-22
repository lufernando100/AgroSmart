import { NextResponse } from 'next/server'
import {
  searchProductsWithDistance,
  searchProductsTextOnly,
  listProductSummaries,
  parseSectorQuery,
  type ProductSummary,
} from '@/lib/catalogo/queries'
import { isUuid } from '@/lib/catalogo/uuid'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sector = parseSectorQuery(searchParams.get('sector'))
    const rawCat = searchParams.get('categoria_id')
    const categoryId =
      rawCat && isUuid(rawCat) ? rawCat : null
    const q = searchParams.get('q')?.trim() ?? ''

    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const latn = lat != null ? Number(lat) : NaN
    const lngn = lng != null ? Number(lng) : NaN
    const hasCoords =
      Number.isFinite(latn) &&
      Number.isFinite(lngn) &&
      Math.abs(latn) <= 90 &&
      Math.abs(lngn) <= 180

    const catFilter = categoryId ?? undefined

    let data: ProductSummary[]

    if (hasCoords) {
      try {
        data = await searchProductsWithDistance({
          lat: latn,
          lng: lngn,
          search: q || null,
          categoryId,
          sector,
        })
      } catch {
        if (q) {
          data = await searchProductsTextOnly({
            search: q,
            categoryId,
            sector,
          })
        } else {
          data = await listProductSummaries({
            sector,
            categoryId: catFilter,
          })
        }
      }
    } else if (q) {
      data = await searchProductsTextOnly({
        search: q,
        categoryId,
        sector,
      })
    } else {
      data = await listProductSummaries({
        sector,
        categoryId: catFilter,
      })
    }

    return NextResponse.json({ data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error en la búsqueda.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
