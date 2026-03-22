import { createClient } from '@/lib/supabase/server'
import { listWarehouseOrders } from '@/lib/pedidos/service'
import { PedidosTabs } from './PedidosTabs'

export default async function AlmacenPedidosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const pedidos = await listWarehouseOrders(user.id)

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-bold text-[#252320]">Pedidos</h1>
      <p className="mt-1 text-sm text-[#736E64]">
        Confirma o rechaza pendientes — se notifica al caficultor automáticamente por WhatsApp.
      </p>

      <div className="mt-6">
        <PedidosTabs pedidos={pedidos} />
      </div>
    </div>
  )
}
