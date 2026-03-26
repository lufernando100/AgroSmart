import { FlaskConical } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MensajeVacio } from '@/components/ui/MensajeVacio'

type HistoryRow = {
  id: string
  created_at: string
  recommendation_text: string | null
  recommendation: { grade?: string } | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function SoilAnalysisHistory() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('soil_analysis')
    .select('id, created_at, recommendation_text, recommendation')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const rows = (data ?? []) as HistoryRow[]

  if (rows.length === 0) {
    return (
      <MensajeVacio
        Icon={FlaskConical}
        title="Sin análisis anteriores"
        description="Aquí aparecerán tus análisis de suelo anteriores."
      />
    )
  }

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-[#252320]">Historial de análisis</h2>
      <ul className="space-y-3">
        {rows.map((row) => {
          const grade = row.recommendation?.grade ?? '—'
          return (
            <li
              key={row.id}
              className="rounded-2xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-[#3A3732]">{formatDate(row.created_at)}</span>
                <span className="rounded-full bg-[#D4E8D4] px-2 py-0.5 text-xs font-semibold text-[#1A481A]">
                  {grade}
                </span>
              </div>
              {row.recommendation_text && (
                <p className="mt-1 text-sm text-[#736E64] line-clamp-2">
                  {row.recommendation_text}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
