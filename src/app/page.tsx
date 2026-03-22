import Link from 'next/link'
import { Leaf, ShoppingBag, MessageCircle, MapPin } from 'lucide-react'

const BENEFICIOS = [
  { Icon: ShoppingBag, texto: 'Compara precios de insumos en almacenes cercanos' },
  { Icon: MessageCircle, texto: 'Asistente IA disponible 24/7 por WhatsApp' },
  { Icon: MapPin, texto: 'Gestiona tu finca, lotes y análisis de suelo' },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8] px-6 py-12">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2D7A2D] shadow-md">
          <Leaf size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#252320] leading-none">GranoVivo</h1>
          <p className="text-sm text-[#8B6914] font-medium">Insumos para caficultores</p>
        </div>
      </div>

      {/* Héroe */}
      <div className="text-center max-w-sm mb-8">
        <p className="text-lg text-[#3A3732] leading-relaxed">
          El marketplace y asistente digital para el caficultor colombiano.
          Compra insumos, gestiona tu finca y consulta con la IA — todo desde el celular.
        </p>
      </div>

      {/* Beneficios */}
      <ul className="w-full max-w-sm flex flex-col gap-3 mb-10">
        {BENEFICIOS.map(({ Icon, texto }) => (
          <li key={texto} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4E8D4]">
              <Icon size={18} className="text-[#2D7A2D]" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="text-sm text-[#524E46]">{texto}</p>
          </li>
        ))}
      </ul>

      {/* CTAs */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Link
          href="/login"
          className="flex h-14 items-center justify-center rounded-2xl bg-[#2D7A2D] text-base font-semibold text-white shadow-md hover:bg-[#236023] active:scale-[0.97] transition-all"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/catalogo"
          className="flex h-12 items-center justify-center rounded-2xl border border-[#D4CEC4] bg-white text-base font-medium text-[#524E46] hover:border-[#2D7A2D]/40 transition-colors"
        >
          Ver catálogo sin registrarse
        </Link>
      </div>

      <p className="mt-8 text-xs text-[#A39E94] text-center">
        Gratuito para caficultores · Funciona en cualquier celular
      </p>
    </div>
  )
}
