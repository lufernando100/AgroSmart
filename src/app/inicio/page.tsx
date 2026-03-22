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

  const rol = user.user_metadata?.rol as string | undefined
  if (rol === 'almacen' || rol === 'admin') {
    redirect('/almacen/dashboard')
  }

  redirect('/catalogo')
}
