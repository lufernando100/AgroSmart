import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShoppingBag, MapPin, Wallet, MessageCircle, ChevronRight, Leaf } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function InicioPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const role = user.user_metadata?.role as string | undefined
  if (role === 'warehouse' || role === 'admin') redirect('/almacen/dashboard')

  const nombre = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'Caficultor'

  const accesos = [
    {
      href: '/catalogo',
      Icon: ShoppingBag,
      titulo: 'Catálogo de insumos',
      descripcion: 'Compara precios y haz pedidos',
      color: { bg: '#ECFDF5', icon: '#059669', border: '#A7F3D0' },
    },
    {
      href: '/mi-finca',
      Icon: MapPin,
      titulo: 'Mi Finca',
      descripcion: 'Lotes, análisis de suelo, floraciones',
      color: { bg: '#FDF6EC', icon: '#D97706', border: '#D4B87A' },
    },
    {
      href: '/mis-costos',
      Icon: Wallet,
      titulo: 'Mis Costos',
      descripcion: 'Gastos, jornales y rentabilidad',
      color: { bg: '#FDFBF7', icon: '#5B473D', border: '#2D1B14' },
    },
    {
      href: '/chat',
      Icon: MessageCircle,
      titulo: 'Asistente IA',
      descripcion: 'Pregúntale al extensionista digital',
      color: { bg: '#EFF4FF', icon: '#3B5BDB', border: '#A5B4FC' },
    },
  ] as const

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* ── Encabezado de bienvenida ──────────────────────────────────────── */}
      <header className="border-b border-[#EAE1D9] bg-white px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#059669]">
            <Leaf size={20} className="text-white" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-medium text-[#9C8F85]">Bienvenido de nuevo,</p>
            <h1 className="text-xl font-bold text-[#1A0F0A]">{nombre}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-5">
        {/* ── Accesos rápidos ───────────────────────────────────────────────── */}
        <p className="mb-4 text-sm font-semibold text-[#5B473D]">Accesos rápidos</p>

        <ul className="flex flex-col gap-3">
          {accesos.map(({ href, Icon, titulo, descripcion, color }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(18,17,16,0.09)] hover:-translate-y-0.5 active:translate-y-0"
                style={{ borderColor: color.border }}
              >
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: color.bg }}
                >
                  <Icon size={22} style={{ color: color.icon }} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#1A0F0A]">{titulo}</p>
                  <p className="text-sm text-[#7B675B]">{descripcion}</p>
                </div>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-[#2D1B14] transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Tip del día ───────────────────────────────────────────────────── */}
        <div className="mt-6 rounded-2xl border border-[#D4B87A] bg-[#FDF6EC] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[#D97706]">Consejo cafetero</p>
          <p className="mt-1 text-sm text-[#5B473D]">
            Revisa los precios del catálogo antes de ir al almacén — puedes ahorrar comprando en línea
            con entrega directa a tu finca.
          </p>
        </div>
      </div>
    </div>
  )
}
