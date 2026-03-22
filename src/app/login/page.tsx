import { Suspense } from 'react'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          GranoVivo
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Ingresa con tu celular
        </p>
      </div>
      <Suspense
        fallback={
          <p className="text-zinc-600 dark:text-zinc-400">Cargando…</p>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
