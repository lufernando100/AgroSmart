import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Punto de entrada "Inicio" (PWA / enlaces externos).
 * La landing pública sigue siendo `/`.
 */
export default async function InicioPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const role = user.user_metadata?.role as string | undefined
  if (role === 'warehouse' || role === 'admin') {
    redirect('/almacen/dashboard')
  }

  redirect('/catalogo')
}
