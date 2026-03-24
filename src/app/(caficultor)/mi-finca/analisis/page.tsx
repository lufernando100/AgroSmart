import { SoilAnalysisForm } from '@/components/finca/SoilAnalysisForm'

export default function AnalisisSueloPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-[#252320]">Mi análisis de suelo</h1>
        <p className="text-sm text-[#736E64]">
          Interpreta el laboratorio con tablas Cenicafé y obtén recomendación de fertilizante.
        </p>
      </header>
      <SoilAnalysisForm />
    </div>
  )
}
