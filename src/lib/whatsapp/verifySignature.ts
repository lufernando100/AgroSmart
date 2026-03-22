import { createHmac, timingSafeEqual } from 'crypto'

export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false
  }
  const expected =
    'sha256=' +
    createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex')
  try {
    const a = Buffer.from(signatureHeader)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}
