import { verifyMetaSignature } from '@/lib/whatsapp/verifySignature'
import { processIncomingWebhook } from '@/lib/whatsapp/processIncoming'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('hub.mode') === 'subscribe') {
    const token = searchParams.get('hub.verify_token')
    const secret = process.env.WHATSAPP_VERIFY_TOKEN
    if (token && secret && token === secret) {
      const ch = searchParams.get('hub.challenge')
      return new Response(ch ?? '', { status: 200 })
    }
  }
  return new Response('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (appSecret) {
    const sig = request.headers.get('x-hub-signature-256')
    if (!verifyMetaSignature(rawBody, sig, appSecret)) {
      return new Response('Invalid signature', { status: 403 })
    }
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody) as unknown
  } catch {
    return new Response('OK', { status: 200 })
  }

  // Esperar a que se procese el webhook para que Vercel Serverless no mate la ejecución
  // antes de que termine de llamar a Supabase o a Anthropic (Claude)
  try {
    await processIncomingWebhook(body)
  } catch (err) {
    console.error('Error procesando webhook de WhatsApp:', err)
  }

  return new Response('OK', { status: 200 })
}
