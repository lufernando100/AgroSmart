/**
 * Sanity check: reads WHATSAPP_* from an env file and GETs the phone object from Graph API.
 * Does not send messages.
 *
 *   node scripts/test-whatsapp-meta.mjs
 *   node scripts/test-whatsapp-meta.mjs .env.local
 *   node scripts/test-whatsapp-meta.mjs .env.supabase.prod
 */
import { loadEnvFile } from './load-env-file.mjs'

const envArg = process.argv[2] || '.env.local'
const loaded = loadEnvFile(envArg)

if (!loaded.ok) {
  console.error(`❌ No existe el archivo de entorno: ${loaded.path}`)
  process.exit(1)
}

const token = process.env.WHATSAPP_TOKEN
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

if (!token || !phoneId) {
  console.error('❌ Falta WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID en el archivo de entorno.')
  process.exit(1)
}

async function testConnection() {
  console.log(`(env: ${loaded.path})`)
  console.log('Probando conexión con Meta (WhatsApp Graph API)...')
  console.log(`Phone ID a consultar: ${phoneId}`)

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (res.ok) {
      console.log('\n✅ ¡Conexión exitosa!')
      console.log('Detalles de la cuenta:')
      console.log(`- Nombre verificado: ${data.verified_name || '(No disponible)'}`)
      console.log(`- Número de teléfono: ${data.display_phone_number || '(No disponible)'}`)
      console.log(`- Calidad (Rating): ${data.quality_rating || '(No disponible)'}`)
    } else {
      console.error('\n❌ La conexión falló. Respuesta de Meta:')
      console.error(JSON.stringify(data.error, null, 2))

      if (data.error?.code === 190) {
        console.log('\n💡 Tip: El token caducó o es inválido. Genera uno nuevo en el panel de Meta.')
      } else if (data.error?.code === 100) {
        console.log(
          '\n💡 Tip: El ID del número de teléfono es incorrecto o no pertenece a la app del token.'
        )
      }
      process.exit(1)
    }
  } catch (err) {
    console.error('\n❌ Error de red:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

await testConnection()
