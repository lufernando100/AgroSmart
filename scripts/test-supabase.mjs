/**
 * Prueba conexión Supabase (anon + service role si existe).
 * Uso: node scripts/test-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const envPath = resolve(root, '.env.local')

function loadDotEnv(path) {
  if (!existsSync(path)) {
    console.error('No existe .env.local en la raíz del proyecto.')
    process.exit(1)
  }
  const text = readFileSync(path, 'utf8')
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    // Siempre tomar valor del archivo (evita que env del sistema deje cadenas vacías y bloquee la carga)
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
    `Proyecto ref (JWT anon): ${jwtRef(anon) ?? '(clave no JWT — p. ej. sb_publishable_)'}`
  )
  if (serviceRole) {
    const jr = jwtRef(serviceRole)
    console.log(
      `Proyecto ref (JWT service): ${jr ?? '(clave no JWT)'}`
    )
    if (jr && jr !== refFromUrl) {
      console.warn(
        '⚠️  El service role no corresponde a esta URL. Las tablas pueden verse vacías vía API.'
      )
    }
  }
} catch {
  console.log('Proyecto: URL no válida')
}

console.log('Anon: probando REST…')
const anonClient = createClient(url, anon)
const { error: anonErr } = await anonClient.from('usuarios').select('id').limit(1)
const { data: anonPrec, error: anonPrecErr } = await anonClient
  .from('precios')
  .select('id')
  .limit(5)
console.log(
  'precios con clave anon:',
  anonPrecErr?.message ?? `${anonPrec?.length ?? 0} filas`
)

if (anonErr) {
  if (missingTable(anonErr.message)) {
    console.log('OK — API responde; tabla `users` no existe aún (ejecuta database/01_data_model.sql).')
  } else if (
    anonErr.message.includes('Invalid API key') ||
    anonErr.message.includes('JWT')
  ) {
    console.error('Fallo — clave anon o URL incorrecta:', anonErr.message)
    process.exit(1)
  } else {
    console.log('OK — API responde. Detalle:', anonErr.message)
  }
} else {
  console.log('OK — consulta a `usuarios` sin error (anon).')
}

if (serviceRole) {
  console.log('Service role: probando…')
  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const { error: srErr } = await admin.from('usuarios').select('id').limit(1)
  if (srErr) {
    if (missingTable(srErr.message)) {
      console.log('OK — service role válido; falta crear tablas.')
    } else if (
      srErr.message.includes('Invalid API key') ||
      srErr.message.includes('JWT')
    ) {
      console.error('Fallo — service role inválido:', srErr.message)
      process.exit(1)
    } else {
      console.error('Fallo —', srErr.message)
      process.exit(1)
    }
  } else {
    console.log('OK — service role y tabla `usuarios` accesibles.')
    const tables = ['categorias', 'productos', 'almacenes', 'precios']
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
      .from('precios')
      .select('id')
      .limit(100)
    console.log(
      'precios vía select limit:',
      precErr?.message ?? `${precRows?.length ?? 0} filas devueltas`
    )
    const { data: muestra, error: muestraErr } = await admin
      .from('categorias')
      .select('id,nombre')
      .limit(3)
    if (muestraErr) {
      console.log('Muestra categorias (error):', muestraErr.message)
    } else {
      const n = muestra?.length ?? 0
      console.log(
        'Muestra categorias (filas devueltas):',
        n,
        n > 0 ? JSON.stringify(muestra) : ''
      )
    }
  }
} else {
  console.log('(Sin SUPABASE_SERVICE_ROLE_KEY — no se prueba service role.)')
}

console.log('Listo.')
