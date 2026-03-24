/**
 * Dev-only: skip middleware redirect to /login for protected routes.
 * APIs and Supabase RLS still require a real session unless you use the anon client for public reads.
 *
 * Enable only in `.env.local`: AUTH_DEV_BYPASS=true
 * Never set this in production (Preview/Production on Vercel).
 */
export function authDevBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.AUTH_DEV_BYPASS === 'true'
  )
}
