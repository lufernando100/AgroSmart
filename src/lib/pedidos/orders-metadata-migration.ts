/**
 * PostgREST / Postgres errors when `orders.metadata` is missing (migration not applied).
 * Used to retry `getOrderForUser` without selecting `metadata`.
 */
export function isMissingOrdersMetadataColumn(err: { message?: string }): boolean {
  const m = (err.message ?? '').toLowerCase()
  return (
    m.includes('metadata') &&
    (m.includes('does not exist') ||
      m.includes('schema cache') ||
      m.includes('could not find the') ||
      m.includes('undefined column'))
  )
}
