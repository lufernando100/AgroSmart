import { notFound } from 'next/navigation'
import { SoilAnalysisForm } from '@/components/finca/SoilAnalysisForm'

export default function DevSoilAnalysisE2EPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] px-4 py-6">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-[#252320]">E2E: análisis de suelo</h1>
        <p className="mt-1 text-sm text-[#736E64]">
          Esta página es solo para pruebas E2E: el test intercepta OCR/interpretar.
        </p>
      </header>

      <SoilAnalysisForm />
    </div>
  )
}

