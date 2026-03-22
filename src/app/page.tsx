import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
          GranoVivo / AgroSmart
        </h1>
        <p className="mt-2 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Marketplace y asistente para caficultores. Inicia sesión para ver el
          catálogo o el panel del almacén.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-lg bg-emerald-700 px-6 py-3 text-center text-base font-medium text-white"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/catalogo"
          className="rounded-lg border border-zinc-300 px-6 py-3 text-center text-base font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
        >
          Ir al catálogo
        </Link>
      </div>
    </div>
  )
}
