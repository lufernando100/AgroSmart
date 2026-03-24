import { describe, it, expect } from 'vitest'
import { friendlyDbError, isFkViolation } from './db-errors'

describe('friendlyDbError', () => {
  it('FK en farmer_id → mensaje de perfil', () => {
    const msg = friendlyDbError({
      code: '23503',
      message: 'insert or update on table "orders" violates foreign key constraint "orders_farmer_id_fkey"',
    })
    expect(msg).toContain('perfil')
    expect(msg).toContain('sesión')
  })

  it('FK en warehouse_id → mensaje de almacén', () => {
    const msg = friendlyDbError({
      code: '23503',
      message: 'violates foreign key constraint "orders_warehouse_id_fkey"',
    })
    expect(msg).toContain('almacén')
    expect(msg).toContain('disponible')
  })

  it('FK en product_id → mensaje de catálogo', () => {
    const msg = friendlyDbError({
      code: '23503',
      message: 'violates foreign key constraint "order_items_product_id_fkey"',
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
      message: 'foreign key constraint "orders_farmer_id_fkey"',
    })
    expect(msg).toContain('perfil')
  })

  it('duplicado por code 23505 → mensaje de registro existente', () => {
    const msg = friendlyDbError({ code: '23505', message: 'duplicate key value' })
    expect(msg).toContain('ya existe')
  })

  it('duplicado por message → mensaje de registro existente', () => {
    const msg = friendlyDbError({ code: '', message: 'unique constraint violated' })
    expect(msg).toContain('ya existe')
  })

  it('not null violation → mensaje de campo obligatorio', () => {
    const msg = friendlyDbError({ code: '23502', message: 'null value in column "order_number"' })
    expect(msg).toContain('obligatorio')
  })

  it('not null por message → mensaje de campo obligatorio', () => {
    const msg = friendlyDbError({ code: '', message: 'not null constraint' })
    expect(msg).toContain('obligatorio')
  })

  it('42501 → mensaje de permisos', () => {
    const msg = friendlyDbError({ code: '42501', message: 'permission denied for table orders' })
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

  it('timeout → mensaje de conexión', () => {
    const msg = friendlyDbError({ code: '', message: 'query timeout exceeded' })
    expect(msg).toContain('tardó demasiado')
  })

  it('tabla ausente (schema cache PostgREST) → mensaje de migraciones', () => {
    const msg = friendlyDbError({
      code: '',
      message: 'Could not find the table public.users in the schema cache',
    })
    expect(msg).toContain('Supabase')
    expect(msg).toContain('01_data_model')
  })

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
        { code: '23503', message: 'orders_farmer_id_fkey' },
        'farmer_id'
      )
    ).toBe(true)
  })

  it('no detecta FK si la columna no coincide', () => {
    expect(
      isFkViolation(
        { code: '23503', message: 'orders_warehouse_id_fkey' },
        'farmer_id'
      )
    ).toBe(false)
  })

  it('no detecta FK en error de duplicado', () => {
    expect(isFkViolation({ code: '23505', message: 'duplicate key' })).toBe(false)
  })
})
