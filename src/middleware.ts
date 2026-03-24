import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { authDevBypassEnabled } from '@/lib/auth/dev-bypass'
const PROTECTED_PREFIXES = [
  '/catalogo',
  '/carrito',
  '/mi-finca',
  '/mis-costos',
  '/chat',
  '/almacen',
] as const

function needsPageAuth(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function defaultHomeForMetadata(role: string | undefined): string {
  if (role === 'warehouse' || role === 'admin') return '/almacen/dashboard'
  return '/catalogo'
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/api/')) {
    return supabaseResponse
  }

  if (pathname === '/login') {
    if (user) {
      const nextParam = request.nextUrl.searchParams.get('next')
      const role = user.user_metadata?.role as string | undefined
      const fallback = defaultHomeForMetadata(role)
      const target =
        nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
          ? nextParam
          : fallback
      return NextResponse.redirect(new URL(target, request.url))
    }
    return supabaseResponse
  }

  if (needsPageAuth(pathname) && !user && !authDevBypassEnabled()) {
    const login = new URL('/login', request.url)
    login.searchParams.set('next', pathname)
    return NextResponse.redirect(login)
  }

  if (user && (pathname === '/almacen' || pathname.startsWith('/almacen/'))) {
    const role = user.user_metadata?.role as string | undefined
    if (role !== 'warehouse' && role !== 'admin') {
      return NextResponse.redirect(new URL('/catalogo', request.url))
    }
  }

  if (user && needsPageAuth(pathname) && !pathname.startsWith('/almacen')) {
    const role = user.user_metadata?.role as string | undefined
    if (role === 'warehouse') {
      return NextResponse.redirect(new URL('/almacen/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
