import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { actualizarPrecioAlmacen } from '@/lib/almacen/precios'
import { isUuid } from '@/lib/catalogo/uuid'

type PatchBody = {
  precio_unitario?: number
  disponible?: boolean
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

    const rol = user.user_metadata?.rol as string | undefined
    if (rol !== 'almacen' && rol !== 'admin') {
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
    const precio =
      typeof body.precio_unitario === 'number' ? body.precio_unitario : undefined
    const disponible =
      typeof body.disponible === 'boolean' ? body.disponible : undefined

    if (precio === undefined && disponible === undefined) {
      return NextResponse.json(
        { error: 'Envía precio_unitario o disponible.' },
        { status: 400 }
      )
    }

    await actualizarPrecioAlmacen({
      usuarioAlmacenId: user.id,
      precioId: id,
      precio_unitario: precio,
      disponible,
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
