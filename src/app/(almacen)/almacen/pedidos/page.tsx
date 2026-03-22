import { createClient } from '@/lib/supabase/server'
import { listWarehouseOrders } from '@/lib/pedidos/service'
import { PedidosTabs } from './PedidosTabs'

export default async function AlmacenPedidosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const pedidos = await listWarehouseOrders(user.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Pedidos</h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Confirma o rechaza pendientes. Al confirmar o rechazar se notifica al caficultor por
        WhatsApp si tiene teléfono en el perfil.
      </p>

      <div className="mt-8">
        <PedidosTabs pedidos={pedidos} />
      </div>
    </div>
  )
}
