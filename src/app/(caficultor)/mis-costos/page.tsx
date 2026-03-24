import { Wallet, Receipt, Users, TrendingUp } from 'lucide-react'

const PROXIMAMENTE = [
  {
    Icon: Receipt,
    titulo: 'Registro de gastos',
    descripcion: 'Toma foto de facturas y regístralas con OCR automático.',
  },
  {
    Icon: Users,
    titulo: 'Jornales',
    descripcion: 'Registra la mano de obra por labor, trabajador y días.',
  },
  {
    Icon: TrendingUp,
    titulo: 'Dashboard de rentabilidad',
    descripcion: 'Compara tus costos por hectárea vs el promedio nacional.',
  },
]

export default function MisCostosPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="border-b border-[#EAE1D9] bg-[#FAF7F2] px-4 py-4">
        <h1 className="text-xl font-bold text-[#1A0F0A]">Mis Costos</h1>
        <p className="text-sm text-[#7B675B]">Gastos, jornales y rentabilidad</p>
      </header>

      <div className="px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#2D1B14] bg-[#FDFBF7] p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAE1D9]">
            <Wallet size={28} className="text-[#5B473D]" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-[#1A0F0A]">Próximamente en Fase 3</h2>
          <p className="text-sm text-[#7B675B]">
            El módulo de costos y rentabilidad se construye sobre el historial de pedidos.
          </p>
        </div>

        <ul className="mt-5 flex flex-col gap-3">
          {PROXIMAMENTE.map(({ Icon, titulo, descripcion }) => (
            <li
              key={titulo}
              className="flex items-start gap-4 rounded-2xl border border-[#EAE1D9] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDFBF7]">
                <Icon size={20} className="text-[#5B473D]" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-[#1A0F0A]">{titulo}</p>
                <p className="mt-0.5 text-sm text-[#7B675B]">{descripcion}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
