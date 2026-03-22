import { describe, it, expect } from 'vitest'
import { friendlyDbError, isFkViolation } from './db-errors'

describe('friendlyDbError', () => {
  // ─── FK violations (23503) ──────────────────────────────────────────────────

  it('FK en caficultor_id → mensaje de perfil', () => {
    const msg = friendlyDbError({
      code: '23503',
      message: 'insert or update on table "pedidos" violates foreign key constraint "pedidos_caficultor_id_fkey"',
    })
    expect(msg).toContain('perfil')
    expect(msg).toContain('sesión')
  })

  it('FK en almacen_id → mensaje de almacén', () => {
    const msg = friendlyDbError({
      code: '23503',
      message: 'violates foreign key constraint "pedidos_almacen_id_fkey"',
    })
    expect(msg).toContain('almacén')
    expect(msg).toContain('disponible')
  })

  it('FK en producto_id → mensaje de catálogo', () => {
    const msg = friendlyDbError({
      code: '23503',
      message: 'violates foreign key constraint "pedido_items_producto_id_fkey"',
    })
    expect(msg).toContain('catálogo')
  })

  it('FK genérica sin columna conocida → mensaje de referencia', () => {
    const msg = friendlyDbError({
      code: '23503',
      message: 'violates foreign key constraint "otra_tabla_fkey"',
    })
    expect(msg).toContain('Referencia inválida')
  })

  it('FK por message sin code → funciona igual', () => {
    const msg = friendlyDbError({
      code: '',
      message: 'foreign key constraint "pedidos_caficultor_id_fkey"',
    })
    expect(msg).toContain('perfil')
  })

  // ─── Duplicado (23505) ──────────────────────────────────────────────────────

  it('duplicado por code 23505 → mensaje de registro existente', () => {
    const msg = friendlyDbError({ code: '23505', message: 'duplicate key value' })
    expect(msg).toContain('ya existe')
  })

  it('duplicado por message → mensaje de registro existente', () => {
    const msg = friendlyDbError({ code: '', message: 'unique constraint violated' })
    expect(msg).toContain('ya existe')
  })

  // ─── Campo nulo (23502) ─────────────────────────────────────────────────────

  it('not null violation → mensaje de campo obligatorio', () => {
    const msg = friendlyDbError({ code: '23502', message: 'null value in column "numero"' })
    expect(msg).toContain('obligatorio')
  })

  it('not null por message → mensaje de campo obligatorio', () => {
    const msg = friendlyDbError({ code: '', message: 'not null constraint' })
    expect(msg).toContain('obligatorio')
  })

  // ─── Permisos (42501 / RLS) ─────────────────────────────────────────────────

  it('42501 → mensaje de permisos', () => {
    const msg = friendlyDbError({ code: '42501', message: 'permission denied for table pedidos' })
    expect(msg).toContain('permiso')
  })

  it('PGRST301 (RLS) → mensaje de permisos', () => {
    const msg = friendlyDbError({ code: 'PGRST301', message: 'row-level security' })
    expect(msg).toContain('permiso')
  })

  it('RLS por message → mensaje de permisos', () => {
    const msg = friendlyDbError({ code: '', message: 'row-level security policy rejected' })
    expect(msg).toContain('permiso')
  })

  // ─── Timeout ────────────────────────────────────────────────────────────────

  it('timeout → mensaje de conexión', () => {
    const msg = friendlyDbError({ code: '', message: 'query timeout exceeded' })
    expect(msg).toContain('tardó demasiado')
  })

  // ─── Genérico ───────────────────────────────────────────────────────────────

  it('error desconocido → mensaje genérico', () => {
    const msg = friendlyDbError({ code: '99999', message: 'some unknown db error' })
    expect(msg).toContain('inesperado')
  })

  it('sin code ni message → mensaje genérico', () => {
    const msg = friendlyDbError({})
    expect(msg).toContain('inesperado')
  })
})

describe('isFkViolation', () => {
  it('detecta FK violation por code', () => {
    expect(isFkViolation({ code: '23503', message: '' })).toBe(true)
  })

  it('detecta FK violation por message', () => {
    expect(isFkViolation({ code: '', message: 'foreign key constraint' })).toBe(true)
  })

  it('detecta FK violation con columna específica', () => {
    expect(
      isFkViolation(
        { code: '23503', message: 'pedidos_caficultor_id_fkey' },
        'caficultor_id'
      )
    ).toBe(true)
  })

  it('no detecta FK si la columna no coincide', () => {
    expect(
      isFkViolation(
        { code: '23503', message: 'pedidos_almacen_id_fkey' },
        'caficultor_id'
      )
    ).toBe(false)
  })

  it('no detecta FK en error de duplicado', () => {
    expect(isFkViolation({ code: '23505', message: 'duplicate key' })).toBe(false)
  })
})
