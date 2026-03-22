import { describe, it, expect, afterEach } from 'vitest'
import { getPublicSupabaseEnv } from './env'

describe('getPublicSupabaseEnv', () => {
  const ORIGINAL_ENV = process.env

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('retorna url y anonKey cuando están configurados', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc123.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'
    const result = getPublicSupabaseEnv()
    expect(result.url).toBe('https://abc123.supabase.co')
    expect(result.anonKey).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test')
  })

  it('lanza error cuando falta SUPABASE_URL', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'key'
    expect(() => getPublicSupabaseEnv()).toThrow('Faltan')
  })

  it('lanza error cuando falta ANON_KEY', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    expect(() => getPublicSupabaseEnv()).toThrow('Faltan')
  })

  it('lanza error con URL inválida', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'no-es-url'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'key'
    expect(() => getPublicSupabaseEnv()).toThrow('no es una URL válida')
  })

  it('lanza error con URL http:// no-local', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://abc.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'key'
    expect(() => getPublicSupabaseEnv()).toThrow('https://')
  })

  it('acepta http://localhost para desarrollo local', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'key'
    const result = getPublicSupabaseEnv()
    expect(result.url).toBe('http://localhost:54321')
  })

  it('acepta http://127.0.0.1 para desarrollo local', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'key'
    const result = getPublicSupabaseEnv()
    expect(result.url).toBe('http://127.0.0.1:54321')
  })

  it('trim de espacios en valores', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '  https://abc.supabase.co  '
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '  key  '
    const result = getPublicSupabaseEnv()
    expect(result.url).toBe('https://abc.supabase.co')
    expect(result.anonKey).toBe('key')
  })
})
