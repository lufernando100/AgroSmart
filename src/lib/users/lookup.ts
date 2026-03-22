import { createAdminClient } from '@/lib/supabase/admin'

/** Looks up a user by phone digits as stored in DB (with or without 57). */
export async function findUserByPhoneDigits(
  phoneDigits: string
): Promise<{ id: string; name: string; phone: string } | null> {
  const admin = createAdminClient()
  const d = phoneDigits.replace(/\D/g, '')
  const variants = [d]
  if (d.length === 10 && d.startsWith('3')) {
    variants.push(`57${d}`)
  }
  if (d.length === 12 && d.startsWith('57')) {
    variants.push(d.slice(2))
  }

  const { data, error } = await admin
    .from('users')
    .select('id, name, phone')
    .in('phone', variants)
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return {
    id: data.id as string,
    name: data.name as string,
    phone: data.phone as string,
  }
}
