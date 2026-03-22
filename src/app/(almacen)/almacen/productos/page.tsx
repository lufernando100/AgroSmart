import { createClient } from '@/lib/supabase/server'
import { listarPreciosAlmacen } from '@/lib/almacen/precios'
import { ProductosPrecios } from './ProductosPrecios'

export default async function AlmacenProductosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const filas = await listarPreciosAlmacen(user.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Productos y precios
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Ajusta precio o marca como agotado. El historial se guarda en la base de datos al
        cambiar el valor.
      </p>

      <div className="mt-8">
        <ProductosPrecios initial={filas} />
      </div>
    </div>
  )
}
