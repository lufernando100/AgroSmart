import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { UserRole } from '@/types/database'

const VALID_ROLES: UserRole[] = ['farmer', 'warehouse', 'admin', 'cooperative']

/** PATCH /api/auth/role — switch active role for the current session */
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: { role?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const requestedRole = body.role as UserRole | undefined
  if (!requestedRole || !VALID_ROLES.includes(requestedRole)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }

  // Verify the user actually has this role in user_roles table
  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', requestedRole)
    .eq('is_active', true)
    .maybeSingle()

  if (!roleRow) {
    return NextResponse.json({ error: 'No tienes ese rol asignado' }, { status: 403 })
  }

  // Update active_role in user_metadata via admin client (service role required)
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, active_role: requestedRole },
  })

  if (error) {
    return NextResponse.json({ error: 'No fue posible cambiar el rol' }, { status: 500 })
  }

  return NextResponse.json({ active_role: requestedRole })
}
