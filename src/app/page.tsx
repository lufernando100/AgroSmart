import Link from 'next/link'
import { Leaf, ShoppingBag, MessageCircle, MapPin } from 'lucide-react'

const BENEFICIOS = [
  { Icon: ShoppingBag, texto: 'Compara precios de insumos en almacenes cercanos' },
  { Icon: MessageCircle, texto: 'Asistente IA disponible 24/7 por WhatsApp' },
  { Icon: MapPin, texto: 'Gestiona tu finca, lotes y análisis de suelo' },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF7F2] px-6 py-12">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#059669] shadow-md">
          <Leaf size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A0F0A] leading-none">GranoVivo</h1>
          <p className="text-sm text-[#D97706] font-medium">Insumos para caficultores</p>
        </div>
      </div>

      {/* Héroe */}
      <div className="text-center max-w-sm mb-8">
        <p className="text-lg text-[#3D2F28] leading-relaxed">
          El marketplace y asistente digital para el caficultor colombiano.
          Compra insumos, gestiona tu finca y consulta con la IA — todo desde el celular.
        </p>
      </div>

      {/* Beneficios */}
      <ul className="w-full max-w-sm flex flex-col gap-3 mb-10">
        {BENEFICIOS.map(({ Icon, texto }) => (
          <li key={texto} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D1FAE5]">
              <Icon size={18} className="text-[#059669]" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="text-sm text-[#5B473D]">{texto}</p>
          </li>
        ))}
      </ul>

      {/* CTAs */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        <Link
          href="/login"
          className="flex h-14 items-center justify-center rounded-2xl bg-[#059669] text-base font-semibold text-white shadow-md hover:bg-[#047857] active:scale-[0.97] transition-all"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/catalogo"
          className="flex h-14 items-center justify-center rounded-2xl border border-[#2D1B14] bg-white text-base font-medium text-[#5B473D] hover:border-[#059669]/40 transition-colors"
        >
          Ver catálogo sin registrarse
        </Link>
      </div>

      <p className="mt-8 text-xs text-[#9C8F85] text-center">
        Gratuito para caficultores · Funciona en cualquier celular
      </p>
    </div>
  )
}
