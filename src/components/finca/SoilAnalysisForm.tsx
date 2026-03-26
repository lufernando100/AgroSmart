'use client'

import { useRef, useMemo, useState } from 'react'
import Link from 'next/link'
import { FlaskConical, Camera } from 'lucide-react'
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

type OcrSuccess = {
  values: Record<string, number>
  image_url: string | null
}

const FIELDS = [
  { key: 'ph', label: 'pH' },
  { key: 'materia_organica', label: 'Materia orgánica (%)' },
  { key: 'fosforo', label: 'Fósforo (mg/kg)' },
  { key: 'potasio', label: 'Potasio (cmol/kg)' },
  { key: 'calcio', label: 'Calcio (cmol/kg)' },
  { key: 'magnesio', label: 'Magnesio (cmol/kg)' },
  { key: 'aluminio', label: 'Aluminio (cmol/kg)' },
  { key: 'azufre', label: 'Azufre (mg/kg)' },
  { key: 'hierro', label: 'Hierro (mg/kg)' },
  { key: 'cobre', label: 'Cobre (mg/kg)' },
  { key: 'manganeso', label: 'Manganeso (mg/kg)' },
  { key: 'zinc', label: 'Zinc (mg/kg)' },
  { key: 'boro', label: 'Boro (mg/kg)' },
  { key: 'cice', label: 'CICE (cmol/kg)' },
] as const

const NIVEL_COLORS: Record<string, string> = {
  bajo: 'text-red-600 font-medium',
  medio: 'text-amber-500 font-medium',
  alto: 'text-green-700 font-medium',
}

type PhotoState = 'idle' | 'uploading' | 'done' | 'error'

export function SoilAnalysisForm() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [farmId, setFarmId] = useState('')
  const [plotId, setPlotId] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ApiSuccess | null>(null)

  const [photoState, setPhotoState] = useState<PhotoState>('idle')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return farmId.trim().length > 0
  }, [farmId])

  const handleChangeValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handlePhotoButtonClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoError(null)
    setPhotoState('uploading')

    // Show preview
    const previewUrl = URL.createObjectURL(file)
    setPhotoPreview(previewUrl)

    try {
      const base64 = await fileToBase64(file)
      const mediaType = normalizeMediaType(file.type)

      const response = await fetch('/api/suelo/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, media_type: mediaType }),
      })
      const data = (await response.json()) as OcrSuccess | ApiError
      if (!response.ok) {
        setPhotoState('error')
        setPhotoError(
          (data as ApiError).error ??
            'No pudimos leer los valores del análisis. Ingrésalos manualmente.'
        )
        return
      }
      const ocr = data as OcrSuccess
      // Pre-fill form fields with extracted values
      const newValues: Record<string, string> = {}
      for (const [key, val] of Object.entries(ocr.values)) {
        newValues[key] = String(val)
      }
      setValues((prev) => ({ ...prev, ...newValues }))
      setImageUrl(ocr.image_url)
      setPhotoState('done')
    } catch {
      setPhotoState('error')
      setPhotoError('No pudimos procesar la foto. Ingrésalos manualmente.')
    } finally {
      // Reset file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
          image_url: imageUrl ?? undefined,
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
        className="rounded-2xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]"
      >
        <h2 className="text-lg font-semibold text-[#252320]">Análisis de suelo</h2>
        <p className="mt-1 text-sm text-[#736E64]">
          Sube la foto del laboratorio o ingresa los valores manualmente.
        </p>

        {/* Photo upload */}
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Subir foto del análisis de suelo"
          />
          <button
            type="button"
            onClick={handlePhotoButtonClick}
            disabled={photoState === 'uploading'}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#A8D1A8] bg-[#F4FAF4] py-3 text-sm font-medium text-[#2D7A2D] disabled:opacity-60"
          >
            <Camera size={18} aria-hidden="true" />
            {photoState === 'uploading'
              ? 'Analizando tu suelo...'
              : photoState === 'done'
                ? 'Foto cargada — toca para cambiar'
                : 'Subir foto del análisis'}
          </button>

          {photoPreview && (
            <div className="mt-2 overflow-hidden rounded-xl border border-[#E8E4DD]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Vista previa del análisis de suelo"
                className="max-h-40 w-full object-contain"
              />
            </div>
          )}

          {photoError && <MensajeError message={photoError} />}
        </div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium text-[#3A3732]">ID de la finca</span>
            <input
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              placeholder="UUID de la finca"
              className="h-14 rounded-xl border border-[#D4CEC4] px-3 text-sm outline-none ring-[#A8D1A8] focus:ring-2"
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm font-medium text-[#3A3732]">ID del lote (opcional)</span>
            <input
              value={plotId}
              onChange={(e) => setPlotId(e.target.value)}
              placeholder="UUID del lote"
              className="h-14 rounded-xl border border-[#D4CEC4] px-3 text-sm outline-none ring-[#A8D1A8] focus:ring-2"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label key={field.key} className="grid gap-1">
                <span className="text-sm font-medium text-[#3A3732]">{field.label}</span>
                <input
                  inputMode="decimal"
                  value={values[field.key] ?? ''}
                  onChange={(e) => handleChangeValue(field.key, e.target.value)}
                  placeholder="0"
                  className="h-14 rounded-xl border border-[#D4CEC4] px-3 text-sm outline-none ring-[#A8D1A8] focus:ring-2"
                />
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="mt-4 h-14 w-full rounded-xl bg-[#2D7A2D] text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Analizando...' : 'Interpretar análisis'}
        </button>
      </form>

      {error ? <MensajeError message={error} /> : null}

      {result ? (
        <article className="rounded-2xl border border-[#E8E4DD] bg-white p-4 shadow-[0_1px_3px_rgba(18,17,16,0.06)]">
          <h3 className="text-base font-semibold text-[#252320]">Resultado</h3>
          <p className="mt-1 text-sm text-[#736E64]">{result.recommendation_text}</p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#736E64]">
                  <th className="py-2">Nutriente</th>
                  <th className="py-2">Valor</th>
                  <th className="py-2">Nivel</th>
                </tr>
              </thead>
              <tbody>
                {result.interpretation.map((row) => (
                  <tr key={row.nutriente} className="border-t border-[#F0EDE7] text-[#3A3732]">
                    <td className="py-2">{row.nutriente}</td>
                    <td className="py-2">{row.valor}</td>
                    <td className={`py-2 capitalize ${NIVEL_COLORS[row.nivel] ?? ''}`}>
                      {row.nivel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link
            href={`/catalogo?q=${encodeURIComponent(result.recommendation.suggestedProductSearch)}`}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-[#2D7A2D] text-sm font-semibold text-[#2D7A2D]"
          >
            Ver precios de {result.recommendation.suggestedProductSearch}
          </Link>
        </article>
      ) : (
        <MensajeVacio
          Icon={FlaskConical}
          title="Aún no has interpretado un análisis"
          description="Sube la foto del laboratorio o completa el formulario para ver el semáforo de nutrientes y la recomendación."
        />
      )}
    </section>
  )
}

// --- Helpers ---

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip "data:image/jpeg;base64," prefix
      const base64 = result.split(',')[1]
      if (base64) resolve(base64)
      else reject(new Error('No se pudo leer el archivo.'))
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo.'))
    reader.readAsDataURL(file)
  })
}

function normalizeMediaType(type: string): string {
  if (type === 'image/png') return 'image/png'
  if (type === 'image/webp') return 'image/webp'
  return 'image/jpeg'
}
