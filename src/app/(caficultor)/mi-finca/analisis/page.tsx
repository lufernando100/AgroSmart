import { Suspense } from 'react'
import { SoilAnalysisForm } from '@/components/finca/SoilAnalysisForm'
import { SoilAnalysisHistory } from '@/components/finca/SoilAnalysisHistory'

export default function AnalisisSueloPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-[#252320]">Mi análisis de suelo</h1>
        <p className="text-sm text-[#736E64]">
          Sube la foto del laboratorio o ingresa los valores para obtener la recomendación Cenicafé.
        </p>
      </header>
      <div className="space-y-6">
        <SoilAnalysisForm />
        <Suspense
          fallback={
            <div className="h-24 animate-pulse rounded-2xl bg-[#F0EDE7]" aria-label="Cargando historial..." />
          }
        >
          <SoilAnalysisHistory />
        </Suspense>
      </div>
    </div>
  )
}
