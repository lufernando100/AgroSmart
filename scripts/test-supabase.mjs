/**
 * Prueba conexión Supabase (anon + service role si existe) contra el esquema en inglés
 * de database/01_data_model.sql (users, categories, products, warehouses, prices).
 *
 * Uso:
 *   npm run test:supabase
 *     → carga .env.local (desarrollo)
 *   npm run test:supabase:prod
 *     → carga .env.supabase.prod (copiá ahí las variables de Vercel Production; no commitear)
 *   node scripts/test-supabase.mjs .env.supabase.prod
 *   SUPABASE_TEST_ENV_FILE=.env.supabase.prod node scripts/test-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const envArg = process.argv[2] ?? process.env.SUPABASE_TEST_ENV_FILE
const envPath = resolve(root, envArg || '.env.local')

function loadDotEnv(path) {
  if (!existsSync(path)) {
    console.error(`No existe el archivo de entorno: ${path}`)
    console.error(
      'Para probar producción: creá .env.supabase.prod con las mismas variables que Vercel (Production) y ejecutá npm run test:supabase:prod'
    )
    process.exit(1)
  }
  const text = readFileSync(path, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    const col = trimmed.indexOf(':')
    let sep = -1
    if (eq !== -1 && (col === -1 || eq < col)) sep = eq
    else if (col !== -1) sep = col
    if (sep === -1) continue
    const key = trimmed.slice(0, sep).trim()
    let val = trimmed.slice(sep + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

function missingTable(msg) {
  if (!msg) return false
  return (
    msg.includes('does not exist') ||
    msg.includes('Could not find the table') ||
    msg.includes('schema cache')
  )
}

/** Solo referencia de proyecto embebida en JWT (sin exponer la clave). */
function jwtRef(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = '='.repeat((4 - (b64.length % 4)) % 4)
    const json = Buffer.from(b64 + pad, 'base64').toString('utf8')
    const payload = JSON.parse(json)
    return typeof payload.ref === 'string' ? payload.ref : null
  } catch {
    return null
  }
}

function jwtRole(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = '='.repeat((4 - (b64.length % 4)) % 4)
    const json = Buffer.from(b64 + pad, 'base64').toString('utf8')
    const payload = JSON.parse(json)
    return typeof payload.role === 'string' ? payload.role : null
  } catch {
    return null
  }
}

console.log(`Cargando entorno desde: ${envPath}`)
loadDotEnv(envPath)

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anon) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  process.exit(1)
}

try {
  const host = new URL(url).hostname
  const refFromUrl = host.split('.')[0]
  console.log(`Proyecto (host): ${host}`)
  console.log(`Proyecto ref (URL): ${refFromUrl}`)
  console.log(
    `Proyecto ref (JWT anon): ${jwtRef(anon) ?? '(clave no JWT — p. ej. publishable)'}`
  )
  console.log(`Rol JWT anon: ${jwtRole(anon) ?? '(n/d)'}`)
  if (serviceRole) {
    const jr = jwtRef(serviceRole)
    console.log(`Proyecto ref (JWT service): ${jr ?? '(clave no JWT)'}`)
    console.log(`Rol JWT service: ${jwtRole(serviceRole) ?? '(n/d)'}`)
    if (jwtRole(serviceRole) && jwtRole(serviceRole) !== 'service_role') {
      console.warn(
        '⚠️  SUPABASE_SERVICE_ROLE_KEY no tiene role=service_role (¿pegaste la anon?).'
      )
    }
    if (jr && jr !== refFromUrl) {
      console.warn(
        '⚠️  El service role no corresponde a esta URL. Revisá que las claves sean del mismo proyecto.'
      )
    }
  }
} catch {
  console.log('Proyecto: URL no válida')
}

console.log('\nAnon: probando REST (tabla categories, legible con 06_catalog_api_read.sql)…')
const anonClient = createClient(url, anon)
const { error: anonCatErr } = await anonClient
  .from('categories')
  .select('id')
  .limit(1)

const { data: anonPrices, error: anonPricesErr } = await anonClient
  .from('prices')
  .select('id')
  .limit(5)
console.log(
  'prices con clave anon:',
  anonPricesErr?.message ?? `${anonPrices?.length ?? 0} filas (máx 5 pedidas)`
)

if (anonCatErr) {
  if (missingTable(anonCatErr.message)) {
    console.log(
      'OK — API responde; tabla `categories` no existe en este proyecto (ejecutá database/01_data_model.sql).'
    )
  } else if (
    anonCatErr.message.includes('Invalid API key') ||
    anonCatErr.message.includes('JWT')
  ) {
    console.error('Fallo — clave anon o URL incorrecta:', anonCatErr.message)
    process.exit(1)
  } else {
    console.log('Anon categories:', anonCatErr.message)
  }
} else {
  console.log('OK — consulta a `categories` sin error (anon).')
}

if (serviceRole) {
  console.log('\nService role: probando tabla `users`…')
  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error: srErr } = await admin.from('users').select('id').limit(1)
  if (srErr) {
    if (missingTable(srErr.message)) {
      console.log('OK — service role válido; falta crear tablas (01_data_model.sql).')
      process.exit(0)
    }
    if (
      srErr.message.includes('Invalid API key') ||
      srErr.message.includes('JWT')
    ) {
      console.error('Fallo — service role inválido:', srErr.message)
      process.exit(1)
    }
    if (
      srErr.message.toLowerCase().includes('row-level security') ||
      srErr.message.includes('42501')
    ) {
      console.error(
        'Fallo — RLS bloqueó lectura con service role (inesperado). Detalle:',
        srErr.message
      )
      process.exit(1)
    }
    console.error('Fallo —', srErr.message)
    process.exit(1)
  }

  console.log('OK — service role y tabla `users` accesibles.')
  const tables = ['categories', 'products', 'warehouses', 'prices']
  for (const t of tables) {
    const { count, error: cErr } = await admin.from(t).select('*', {
      count: 'exact',
      head: true,
    })
    if (cErr) {
      console.log(`  ${t}: (error) ${cErr.message}`)
    } else {
      console.log(`  ${t}: ${count ?? 0} filas (count exact)`)
    }
  }

  const { data: precRows, error: precErr } = await admin
    .from('prices')
    .select('id')
    .limit(100)
  console.log(
    'prices vía select limit:',
    precErr?.message ?? `${precRows?.length ?? 0} filas devueltas`
  )

  const { data: sample, error: sampleErr } = await admin
    .from('categories')
    .select('id,name')
    .limit(3)
  if (sampleErr) {
    console.log('Muestra categories (error):', sampleErr.message)
  } else {
    const n = sample?.length ?? 0
    console.log(
      'Muestra categories:',
      n,
      n > 0 ? JSON.stringify(sample) : ''
    )
  }
} else {
  console.log('\n(Sin SUPABASE_SERVICE_ROLE_KEY — no se prueba service role.)')
}

console.log('\nListo.')
