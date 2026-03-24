import { MapPin, Sprout, FlaskConical } from 'lucide-react'
import Link from 'next/link'

const PROXIMAMENTE = [
  {
    Icon: MapPin,
    titulo: 'Mapa de tu finca',
    descripcion: 'Registra tu finca con GPS y dibuja los lotes sobre el mapa satelital.',
  },
  {
    Icon: Sprout,
    titulo: 'Floraciones y cosecha',
    descripcion: 'Registra floraciones y calcula automáticamente las fechas de cosecha y fertilización.',
  },
  {
    Icon: FlaskConical,
    titulo: 'Análisis de suelo',
    descripcion: 'Toma foto del análisis del laboratorio y recibe recomendaciones con tablas Cenicafé.',
  },
]

export default function MiFincaPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="border-b border-[#EAE1D9] bg-[#FAF7F2] px-4 py-4">
        <h1 className="text-xl font-bold text-[#1A0F0A]">Mi Finca</h1>
        <p className="text-sm text-[#7B675B]">Gestiona tus lotes y análisis de suelo</p>
      </header>

      <div className="px-4 py-6">
        <Link
          href="/mi-finca/analisis"
          className="mb-4 inline-flex h-14 w-full items-center justify-center rounded-xl bg-[#059669] px-4 text-base font-semibold text-white"
        >
          Ver análisis de suelo
        </Link>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#D4B87A] bg-[#FDF6EC] p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5E8C8]">
            <MapPin size={28} className="text-[#D97706]" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-[#1A0F0A]">Próximamente en Fase 2</h2>
          <p className="text-sm text-[#7B675B]">
            Estamos construyendo las funciones de inteligencia agronómica.
          </p>
        </div>

        <ul className="mt-5 flex flex-col gap-3">
          {PROXIMAMENTE.map(({ Icon, titulo, descripcion }) => (
            <li
              key={titulo}
              className="flex items-start gap-4 rounded-2xl border border-[#EAE1D9] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDFBF7]">
                <Icon size={20} className="text-[#D97706]" strokeWidth={1.75} aria-hidden />
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
