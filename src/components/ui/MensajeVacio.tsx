import type { LucideIcon } from 'lucide-react'

type Props = {
  /** Lucide icon component (pass the component, not an instance). */
  Icon: LucideIcon
  /** Heading for the empty state. */
  title: string
  /** Optional description with a suggested next step. */
  description?: string
  /** Primary action button. */
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Reusable empty state for lists, search results and sections with no data.
 * Always shows a friendly message + a suggested next step.
 */
export function MensajeVacio({
  Icon,
  title,
  description,
  action,
  className = '',
}: Props) {
  return (
    <div
      className={`flex flex-col items-center gap-4 py-12 text-center ${className}`}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FDFBF7]">
        <Icon size={36} className="text-[#2D1B14]" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-lg font-semibold text-[#3D2F28]">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-[#7B675B]">{description}</p>
        ) : null}
      </div>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-xl bg-[#059669] px-6 py-3 text-base font-semibold text-white hover:bg-[#047857]"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
