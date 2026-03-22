import { MessageCircle, Mic, Image, ShoppingBag } from 'lucide-react'

const CAPACIDADES = [
  {
    Icon: ShoppingBag,
    titulo: 'Compra por chat',
    descripcion: '«Necesito urea para 2 hectáreas» — te muestra precios y hace el pedido.',
  },
  {
    Icon: Image,
    titulo: 'Análisis de suelo',
    descripcion: 'Envía foto del análisis del laboratorio y recibe recomendaciones.',
  },
  {
    Icon: Mic,
    titulo: 'Nota de voz',
    descripcion: 'Habla en lugar de escribir — transcribimos y respondemos igual.',
  },
]

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="border-b border-[#E8E4DD] bg-[#FAFAF8] px-4 py-4">
        <h1 className="text-xl font-bold text-[#252320]">Asistente IA</h1>
        <p className="text-sm text-[#736E64]">Tu extensionista digital disponible 24/7</p>
      </header>

      <div className="px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#A5B4FC] bg-[#EFF4FF] p-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E0E7FF]">
            <MessageCircle size={28} className="text-[#3B5BDB]" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-[#252320]">Chat disponible por WhatsApp</h2>
          <p className="text-sm text-[#736E64]">
            El asistente ya está activo en WhatsApp. La versión integrada en la app llega próximamente.
          </p>
        </div>

        <ul className="mt-5 flex flex-col gap-3">
          {CAPACIDADES.map(({ Icon, titulo, descripcion }) => (
            <li
              key={titulo}
              className="flex items-start gap-4 rounded-2xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF4FF]">
                <Icon size={20} className="text-[#3B5BDB]" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-[#252320]">{titulo}</p>
                <p className="mt-0.5 text-sm text-[#736E64]">{descripcion}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
