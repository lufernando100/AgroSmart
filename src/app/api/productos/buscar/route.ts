import { NextResponse } from 'next/server'
import {
  buscarProductosConDistancia,
  buscarProductosSoloTexto,
  listarProductosResumen,
  parseSector,
  type ProductoListado,
} from '@/lib/catalogo/queries'
import { isUuid } from '@/lib/catalogo/uuid'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sector = parseSector(searchParams.get('sector'))
    const rawCat = searchParams.get('categoria_id')
    const categoriaId =
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

    const catFilter = categoriaId ?? undefined

    let data: ProductoListado[]

    if (hasCoords) {
      try {
        data = await buscarProductosConDistancia({
          lat: latn,
          lng: lngn,
          busqueda: q || null,
          categoriaId,
          sector,
        })
      } catch {
        if (q) {
          data = await buscarProductosSoloTexto({
            busqueda: q,
            categoriaId,
            sector,
          })
        } else {
          data = await listarProductosResumen({
            sector,
            categoriaId: catFilter,
          })
        }
      }
    } else if (q) {
      data = await buscarProductosSoloTexto({
        busqueda: q,
        categoriaId,
        sector,
      })
    } else {
      data = await listarProductosResumen({
        sector,
        categoriaId: catFilter,
      })
    }

    return NextResponse.json({ data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error en la búsqueda.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
