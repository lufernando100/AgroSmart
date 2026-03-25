import { describe, it, expect } from 'vitest'
import { isMissingOrdersMetadataColumn } from './orders-metadata-migration'

describe('isMissingOrdersMetadataColumn', () => {
  it('returns true for typical PostgREST missing column message', () => {
    expect(
      isMissingOrdersMetadataColumn({
        message: 'column orders.metadata does not exist',
      })
    ).toBe(true)
  })

  it('returns true for schema cache wording', () => {
    expect(
      isMissingOrdersMetadataColumn({
        message: 'Could not find the metadata column of orders in the schema cache',
      })
    ).toBe(true)
  })

  it('returns false for unrelated errors', () => {
    expect(isMissingOrdersMetadataColumn({ message: 'JWT expired' })).toBe(false)
    expect(isMissingOrdersMetadataColumn({ message: 'permission denied for table orders' })).toBe(
      false
    )
  })

  it('returns false when metadata is mentioned but not a missing-column case', () => {
    expect(
      isMissingOrdersMetadataColumn({
        message: 'invalid input syntax for type json in metadata',
      })
    ).toBe(false)
  })
})
