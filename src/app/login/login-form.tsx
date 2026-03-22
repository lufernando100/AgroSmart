'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function LoginForm() {
  const searchParams = useSearchParams()
  const nextParam = searchParams.get('next')

  const [phone, setPhone] = useState('')
  const [token, setToken] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function sendOtp() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'send', phone }),
      })
      const data = (await res.json()) as { error?: string; ok?: boolean }
      if (!res.ok) {
        setMessage(data.error ?? 'No se pudo enviar el código.')
        return
      }
      setStep('code')
      setToken('')
      setMessage(
        'Revisa el SMS. El código caduca en poco tiempo (ajustá la vigencia en Supabase → Auth → Phone si hace falta).'
      )
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'verify',
          phone,
          token: token.replace(/\s/g, ''),
        }),
      })
      const data = (await res.json()) as {
        error?: string
        ok?: boolean
        redirect?: string
      }
      if (!res.ok) {
        setMessage(data.error ?? 'Código incorrecto o expirado.')
        return
      }
      const target =
        nextParam &&
        nextParam.startsWith('/') &&
        !nextParam.startsWith('//')
          ? nextParam
          : (data.redirect ?? '/catalogo')
      window.location.assign(target)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        Celular (Colombia)
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="300 123 4567"
          value={phone}
          disabled={step === 'code' || loading}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-emerald-600 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>

      {step === 'code' ? (
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          Código SMS
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={token}
            disabled={loading}
            onChange={(e) => setToken(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-emerald-600 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </label>
      ) : null}

      {step === 'phone' ? (
        <button
          type="button"
          disabled={loading || !phone.trim()}
          onClick={() => void sendOtp()}
          className="rounded-lg bg-emerald-700 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
        >
          {loading ? 'Enviando…' : 'Enviar código'}
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={loading || token.trim().length < 4}
            onClick={() => void verifyOtp()}
            className="rounded-lg bg-emerald-700 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Verificando…' : 'Ingresar'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void sendOtp()}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
          >
            {loading ? 'Enviando…' : 'Reenviar código'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep('phone')
              setToken('')
              setMessage(null)
            }}
            className="text-sm text-zinc-600 underline dark:text-zinc-400"
          >
            Cambiar número
          </button>
        </div>
      )}

      {message ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      ) : null}
    </div>
  )
}
