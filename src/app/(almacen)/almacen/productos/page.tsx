import { createClient } from '@/lib/supabase/server'
import { listWarehousePrices } from '@/lib/almacen/precios'
import { ProductosPrecios } from './ProductosPrecios'

export default async function AlmacenProductosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const filas = await listWarehousePrices(user.id)

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold text-[#252320]">Productos y precios</h1>
      <p className="mt-1 text-sm text-[#736E64]">
        Ajusta precios o marca como agotado. El historial se guarda automáticamente.
      </p>

      <div className="mt-6">
        <ProductosPrecios initial={filas} />
      </div>
    </div>
  )
}
