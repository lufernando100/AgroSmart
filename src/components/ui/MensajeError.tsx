import { AlertCircle, RefreshCw } from 'lucide-react'

type Props = {
  /** Mensaje a mostrar al usuario. Debe ser en español, sin jerga técnica. */
  message: string
  /** Callback opcional para reintentar la acción que falló. */
  onRetry?: () => void
  /** Clases CSS adicionales para el contenedor. */
  className?: string
}

/**
 * Componente de error reutilizable — cumple WCAG con role="alert" y foco automático.
 *
 * REGLA: Nunca pasar mensajes de error crudos de Postgres al prop `message`.
 * Usar siempre `friendlyDbError()` antes de renderizar este componente.
 */
export function MensajeError({ message, onRetry, className = '' }: Props) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex flex-col gap-3 rounded-xl border border-[#C23B22]/30 bg-[#C23B22]/8 px-4 py-3 ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle
          size={18}
          className="mt-0.5 shrink-0 text-[#C23B22]"
          aria-hidden
        />
        <p className="text-sm font-medium leading-snug text-[#8B2112]">
          {message}
        </p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#C23B22] underline underline-offset-2"
        >
          <RefreshCw size={14} aria-hidden />
          Reintentar
        </button>
      ) : null}
    </div>
  )
}
