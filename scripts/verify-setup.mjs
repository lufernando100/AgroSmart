#!/usr/bin/env node
/**
 * Verificación local de conectividad (Supabase + opcional WhatsApp Meta).
 *
 * Uso:
 *   npm run verify:local
 *     → usa .env.local
 *   npm run verify:prod
 *     → usa .env.supabase.prod (crealo copiando variables de Vercel Production; no commitear)
 *   node scripts/verify-setup.mjs /ruta/a/.env
 *
 * No imprime secretos; solo si cada variable está definida (sí/no).
 */
import { spawnSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { loadEnvFile, root } from './load-env-file.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envArg = process.argv[2] || '.env.local'
const loaded = loadEnvFile(envArg)

if (!loaded.ok) {
  console.error(`❌ No se pudo cargar el entorno: ${loaded.path}`)
  console.error(
    '   Para prod: exportá variables desde Vercel a un archivo, p. ej. .env.supabase.prod'
  )
  process.exit(1)
}

console.log(`\n📁 Entorno: ${loaded.path}\n`)

const groups = [
  {
    title: 'Supabase (PWA + API)',
    keys: [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ],
  },
  {
    title: 'WhatsApp Cloud API',
    keys: [
      'WHATSAPP_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_VERIFY_TOKEN',
      'WHATSAPP_APP_SECRET',
    ],
  },
  {
    title: 'Asistente (webhook / tools)',
    keys: ['ANTHROPIC_API_KEY'],
  },
  {
    title: 'Opcional',
    keys: ['OPENAI_API_KEY', 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'],
  },
]

let missingRequired = false
for (const g of groups) {
  console.log(`── ${g.title} ──`)
  for (const k of g.keys) {
    const v = process.env[k]
    const set = v != null && String(v).trim() !== ''
    const mark = set ? '✓' : '✗'
    console.log(`  ${mark} ${k}`)
    if (
      !set &&
      (k === 'NEXT_PUBLIC_SUPABASE_URL' ||
        k === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' ||
        k === 'SUPABASE_SERVICE_ROLE_KEY')
    ) {
      missingRequired = true
    }
  }
  console.log('')
}

if (missingRequired) {
  console.error('❌ Faltan variables obligatorias de Supabase. Completá el archivo y reintentá.\n')
  process.exit(1)
}

function runScript(scriptName, args = []) {
  const scriptPath = resolve(__dirname, scriptName)
  return spawnSync(process.execPath, [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
  })
}

console.log('══════════════════════════════════════')
console.log(' 1) Supabase (REST + service role)')
console.log('══════════════════════════════════════\n')

const sup = runScript('test-supabase.mjs', [envArg])
if (sup.status !== 0) {
  process.exit(sup.status ?? 1)
}

const hasWa =
  process.env.WHATSAPP_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()

if (hasWa) {
  console.log('\n══════════════════════════════════════')
  console.log(' 2) WhatsApp Meta (GET / phone object)')
  console.log('══════════════════════════════════════\n')
  const wa = runScript('test-whatsapp-meta.mjs', [envArg])
  if (wa.status !== 0) {
    process.exit(wa.status ?? 1)
  }
} else {
  console.log('\n⏭  Omitido WhatsApp Meta (faltan WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID).\n')
}

console.log('\n══════════════════════════════════════')
console.log(' 3) Comprobaciones manuales (no automatizables aquí)')
console.log('══════════════════════════════════════\n')
console.log('• Meta → Webhook: URL debe ser https://TU-DOMINIO/api/whatsapp/webhook')
console.log('  Verificar GET (reemplazá TOKEN y BASE):')
console.log(
  '  curl "https://BASE/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=prueba"'
)
console.log('  → respuesta debe ser solo: prueba')
console.log('• Supabase → Auth → URL: Site URL y Redirects con tu dominio de Vercel.')
console.log('• SQL: ejecutá database/11_orders_metadata.sql si usás avisos metadata en pedidos.')
console.log('• Tras cambiar .env en Vercel: Redeploy.\n')
console.log('• Suite automatizada: npm run ci   (lint + types + tests + build)\n')
