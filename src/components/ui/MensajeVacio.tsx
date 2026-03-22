import type { LucideIcon } from 'lucide-react'

type Props = {
  /** Ícono de Lucide a mostrar (pasar el componente, no la instancia). */
  Icono: LucideIcon
  /** Título del estado vacío. */
  titulo: string
  /** Descripción opcional con sugerencia de acción. */
  descripcion?: string
  /** Botón de acción principal. */
  accion?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Estado vacío reutilizable para listas, buscadores y secciones sin datos.
 * Usa siempre un mensaje amigable + sugerencia de siguiente paso.
 */
export function MensajeVacio({
  Icono,
  titulo,
  descripcion,
  accion,
  className = '',
}: Props) {
  return (
    <div
      className={`flex flex-col items-center gap-4 py-12 text-center ${className}`}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#F5F3EF]">
        <Icono size={36} className="text-[#D4CEC4]" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-lg font-semibold text-[#3A3732]">{titulo}</p>
        {descripcion ? (
          <p className="mt-1 text-sm text-[#736E64]">{descripcion}</p>
        ) : null}
      </div>
      {accion ? (
        <button
          type="button"
          onClick={accion.onClick}
          className="rounded-xl bg-[#2D7A2D] px-6 py-3 text-base font-semibold text-white hover:bg-[#236023]"
        >
          {accion.label}
        </button>
      ) : null}
    </div>
  )
}
