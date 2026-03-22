import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}))

import { LoginForm } from './login-form'

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza el campo de teléfono', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText('300 123 4567')).toBeInTheDocument()
  })

  it('renderiza el botón "Enviar código"', () => {
    render(<LoginForm />)
    expect(screen.getByText('Enviar código')).toBeInTheDocument()
  })

  it('deshabilita el botón sin teléfono', () => {
    render(<LoginForm />)
    const btn = screen.getByText('Enviar código')
    expect(btn).toBeDisabled()
  })

  it('habilita el botón al escribir teléfono', () => {
    render(<LoginForm />)
    const input = screen.getByPlaceholderText('300 123 4567')
    fireEvent.change(input, { target: { value: '3001234567' } })
    const btn = screen.getByText('Enviar código')
    expect(btn).not.toBeDisabled()
  })

  it('muestra campo de código después de enviar OTP exitoso', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<LoginForm />)
    const input = screen.getByPlaceholderText('300 123 4567')
    fireEvent.change(input, { target: { value: '3001234567' } })

    const btn = screen.getByText('Enviar código')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument()
    })
  })

  it('muestra error si la API falla al enviar OTP', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Número no válido' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<LoginForm />)
    const input = screen.getByPlaceholderText('300 123 4567')
    fireEvent.change(input, { target: { value: '123' } })

    const btn = screen.getByText('Enviar código')
    fireEvent.click(btn)

    await waitFor(() => {
      expect(screen.getByText('Número no válido')).toBeInTheDocument()
    })
  })

  it('muestra botones "Ingresar", "Reenviar" y "Cambiar número" en step code', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<LoginForm />)
    fireEvent.change(screen.getByPlaceholderText('300 123 4567'), {
      target: { value: '3001234567' },
    })
    fireEvent.click(screen.getByText('Enviar código'))

    await waitFor(() => {
      expect(screen.getByText('Ingresar')).toBeInTheDocument()
      expect(screen.getByText('Reenviar código')).toBeInTheDocument()
      expect(screen.getByText('Cambiar número')).toBeInTheDocument()
    })
  })

  it('deshabilita "Ingresar" con código corto', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<LoginForm />)
    fireEvent.change(screen.getByPlaceholderText('300 123 4567'), {
      target: { value: '3001234567' },
    })
    fireEvent.click(screen.getByText('Enviar código'))

    await waitFor(() => {
      expect(screen.getByText('Ingresar')).toBeDisabled()
    })
  })

  it('muestra error amigable cuando el backend responde con error de perfil (FK)', async () => {
    // Simula el caso donde OTP fue exitoso pero syncUsuarioAfterAuth falló
    // y el backend retorna el mensaje amigable que debería ver el usuario.
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () =>
          Promise.resolve({
            error: 'Tu perfil no está listo. Cierra sesión, vuelve a entrar e intenta de nuevo.',
          }),
      })
    vi.stubGlobal('fetch', mockFetch)

    render(<LoginForm />)
    fireEvent.change(screen.getByPlaceholderText('300 123 4567'), {
      target: { value: '3001234567' },
    })
    fireEvent.click(screen.getByText('Enviar código'))

    await waitFor(() => {
      expect(screen.getByPlaceholderText('123456')).toBeInTheDocument()
    })

    const codeInput = screen.getByPlaceholderText('123456')
    fireEvent.change(codeInput, { target: { value: '123456' } })
    fireEvent.click(screen.getByText('Ingresar'))

    await waitFor(() => {
      expect(
        screen.getByText(/perfil no está listo/i)
      ).toBeInTheDocument()
    })
  })

  it('vuelve a step phone al hacer click en "Cambiar número"', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<LoginForm />)
    fireEvent.change(screen.getByPlaceholderText('300 123 4567'), {
      target: { value: '3001234567' },
    })
    fireEvent.click(screen.getByText('Enviar código'))

    await waitFor(() => {
      expect(screen.getByText('Cambiar número')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Cambiar número'))
    expect(screen.getByText('Enviar código')).toBeInTheDocument()
  })
})
