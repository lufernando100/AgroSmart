'use client'

import { useMemo, useState } from 'react'
import { FlaskConical } from 'lucide-react'
import { MensajeError } from '@/components/ui/MensajeError'
import { MensajeVacio } from '@/components/ui/MensajeVacio'

type ApiSuccess = {
  id: string
  interpretation: Array<{
    nutriente: string
    valor: number
    nivel: 'bajo' | 'medio' | 'alto'
  }>
  recommendation: {
    grade: string
    doseKgHaYear: number
    splitPerYear: number
    suggestedProductSearch: string
  }
  recommendation_text: string
}

type ApiError = { error?: string }

const FIELDS = [
  { key: 'ph', label: 'pH' },
  { key: 'materia_organica', label: 'Materia orgánica (%)' },
  { key: 'fosforo', label: 'Fósforo (mg/kg)' },
  { key: 'potasio', label: 'Potasio (cmol/kg)' },
  { key: 'magnesio', label: 'Magnesio (cmol/kg)' },
  { key: 'azufre', label: 'Azufre (mg/kg)' },
] as const

export function SoilAnalysisForm() {
  const [farmId, setFarmId] = useState('')
  const [plotId, setPlotId] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ApiSuccess | null>(null)

  const canSubmit = useMemo(() => {
    return farmId.trim().length > 0
  }, [farmId])

  const handleChangeValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!farmId.trim()) {
      setError('Debes ingresar la finca para interpretar el análisis.')
      return
    }

    const parsedValues: Record<string, number> = {}
    for (const [key, value] of Object.entries(values)) {
      if (!value.trim()) continue
      const parsed = Number(value)
      if (Number.isNaN(parsed)) {
        setError('Todos los valores del análisis deben ser numéricos.')
        return
      }
      parsedValues[key] = parsed
    }

    if (Object.keys(parsedValues).length === 0) {
      setError('Ingresa al menos un valor del análisis para continuar.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/suelo/interpretar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: farmId.trim(),
          plot_id: plotId.trim() || undefined,
          valores: parsedValues,
        }),
      })
      const data = (await response.json()) as ApiSuccess | ApiError
      if (!response.ok) {
        const apiError = (data as ApiError).error
        setError(apiError ?? 'No fue posible interpretar el análisis.')
        return
      }
      setResult(data as ApiSuccess)
    } catch {
      setError('No pudimos conectar con el servidor. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-[#EAE1D9] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]"
      >
        <h2 className="text-lg font-semibold text-[#1A0F0A]">Análisis de suelo</h2>
        <p className="mt-1 text-sm text-[#7B675B]">
          Ingresa los valores del laboratorio para obtener la recomendación.
        </p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-[#3D2F28]">ID de la finca</span>
            <input
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              placeholder="UUID de la finca"
              className="h-14 rounded-xl border border-[#2D1B14] px-3 text-sm outline-none ring-[#A7F3D0] focus:ring-2"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-[#3D2F28]">ID del lote (opcional)</span>
            <input
              value={plotId}
              onChange={(e) => setPlotId(e.target.value)}
              placeholder="UUID del lote"
              className="h-14 rounded-xl border border-[#2D1B14] px-3 text-sm outline-none ring-[#A7F3D0] focus:ring-2"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label key={field.key} className="grid gap-1">
                <span className="text-sm font-medium text-[#3D2F28]">{field.label}</span>
                <input
                  inputMode="decimal"
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChangeValue(field.key, e.target.value)}
                  placeholder="0"
                  className="h-14 rounded-xl border border-[#2D1B14] px-3 text-sm outline-none ring-[#A7F3D0] focus:ring-2"
                />
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="mt-4 h-14 w-full rounded-xl bg-[#059669] text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Analizando...' : 'Interpretar análisis'}
        </button>
      </form>

      {error ? <MensajeError message={error} /> : null}

      {result ? (
        <article className="rounded-2xl border border-[#EAE1D9] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]">
          <h3 className="text-base font-semibold text-[#1A0F0A]">Resultado</h3>
          <p className="mt-1 text-sm text-[#7B675B]">{result.recommendation_text}</p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#7B675B]">
                  <th className="py-2">Nutriente</th>
                  <th className="py-2">Valor</th>
                  <th className="py-2">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {result.interpretation.map((row) => (
                  <tr key={row.nutriente} className="border-t border-[#F0EDE7] text-[#3D2F28]">
                    <td className="py-2">{row.nutriente}</td>
                    <td className="py-2">{row.valor}</td>
                    <td className="py-2 capitalize">{row.nivel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm text-[#3D2F28]">
            Ver precios de este fertilizante: <strong>{result.recommendation.suggestedProductSearch}</strong>
          </p>
        </article>
      ) : (
        <MensajeVacio
          Icon={FlaskConical}
          title="Aún no has interpretado un análisis"
          description="Completa el formulario para ver el semáforo de nutrientes y la recomendación."
        />
      )}
    </section>
  )
}
