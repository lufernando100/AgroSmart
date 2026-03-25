import { describe, it, expect } from 'vitest'
import { ASSISTANT_PROMPT_VERSION } from './version'

describe('ASSISTANT_PROMPT_VERSION', () => {
  it('follows semver MAJOR.MINOR.PATCH', () => {
    expect(ASSISTANT_PROMPT_VERSION).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
