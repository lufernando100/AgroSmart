/**
 * Sanity check: reads WHATSAPP_* from repo-root .env.local and GETs the phone object from Graph API.
 * Does not send messages. Run: node scripts/test-whatsapp-meta.mjs
 */
import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')

if (!fs.existsSync(envPath)) {
  console.error('❌ No existe .env.local en la raíz del proyecto.')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = Object.fromEntries(
  envContent
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=')
      return [
        line.slice(0, idx),
        line.slice(idx + 1).replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1'),
      ]
    })
)

const token = envVars['WHATSAPP_TOKEN']
const phoneId = envVars['WHATSAPP_PHONE_NUMBER_ID']

if (!token || !phoneId) {
  console.error('❌ Falta WHATSAPP_TOKEN o WHATSAPP_PHONE_NUMBER_ID en .env.local')
  process.exit(1)
}

async function testConnection() {
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
    }
  } catch (err) {
    console.error('\n❌ Error de red:', err instanceof Error ? err.message : err)
  }
}

testConnection()
