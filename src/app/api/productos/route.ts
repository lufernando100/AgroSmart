import { NextResponse } from 'next/server'
import {
  listarProductosResumen,
  parseSector,
} from '@/lib/catalogo/queries'
import { isUuid } from '@/lib/catalogo/uuid'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sector = parseSector(searchParams.get('sector'))
    const rawCat = searchParams.get('categoria_id')
    const categoriaId =
      rawCat && isUuid(rawCat) ? rawCat : undefined

    const data = await listarProductosResumen({ sector, categoriaId })
    return NextResponse.json({ data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al listar productos.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
