import { describe, it, expect } from 'vitest'
import { createHmac } from 'crypto'
import { verifyMetaSignature } from './verifySignature'

const APP_SECRET = 'test_app_secret_123'

function makeSignature(body: string, secret: string): string {
  return 'sha256=' + createHmac('sha256', secret).update(body, 'utf8').digest('hex')
}

describe('verifyMetaSignature', () => {
  it('valida firma correcta', () => {
    const body = '{"entry":[{"changes":[]}]}'
    const sig = makeSignature(body, APP_SECRET)
    expect(verifyMetaSignature(body, sig, APP_SECRET)).toBe(true)
  })

  it('rechaza firma incorrecta', () => {
    const body = '{"entry":[{"changes":[]}]}'
    const wrongSig = makeSignature('otro body', APP_SECRET)
    expect(verifyMetaSignature(body, wrongSig, APP_SECRET)).toBe(false)
  })

  it('rechaza cuando signatureHeader es null', () => {
    expect(verifyMetaSignature('body', null, APP_SECRET)).toBe(false)
  })

  it('rechaza cuando signatureHeader no empieza con sha256=', () => {
    expect(verifyMetaSignature('body', 'md5=abc', APP_SECRET)).toBe(false)
  })

  it('rechaza cuando secret es diferente', () => {
    const body = '{"data":"test"}'
    const sig = makeSignature(body, APP_SECRET)
    expect(verifyMetaSignature(body, sig, 'otro_secret')).toBe(false)
  })

  it('rechaza string vacío como firma', () => {
    expect(verifyMetaSignature('body', '', APP_SECRET)).toBe(false)
  })
})
