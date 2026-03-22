import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateWarehousePrice } from '@/lib/almacen/precios'
import { isUuid } from '@/lib/catalogo/uuid'

type PatchBody = {
  unit_price?: number
  is_available?: boolean
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    if (!isUuid(id)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    const role = user.user_metadata?.role as string | undefined
    if (role !== 'warehouse' && role !== 'admin') {
      return NextResponse.json({ error: 'No permitido.' }, { status: 403 })
    }

    let json: unknown
    try {
      json = await request.json()
    } catch {
      return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
    }

    if (!isRecord(json)) {
      return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 })
    }

    const body = json as PatchBody
    const unit_price =
      typeof body.unit_price === 'number' ? body.unit_price : undefined
    const is_available =
      typeof body.is_available === 'boolean' ? body.is_available : undefined

    if (unit_price === undefined && is_available === undefined) {
      return NextResponse.json(
        { error: 'Envía unit_price o is_available.' },
        { status: 400 }
      )
    }

    await updateWarehousePrice({
      warehouseUserId: user.id,
      priceId: id,
      unit_price,
      is_available,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
