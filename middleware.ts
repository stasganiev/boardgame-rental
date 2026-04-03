import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const locales = ['en', 'ru']
const defaultLocale = 'en'

// Routes that require authentication
const protectedRoutes = ['/profile', '/listings/new', '/bookings', '/admin']
// Routes only for unauthenticated users
const authRoutes = ['/login', '/register', '/forgot-password']

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().substring(0, 2))
      .find((lang) => locales.includes(lang))
    if (preferred) return preferred
  }
  return defaultLocale
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // i18n redirect
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url)
    )
  }

  // Extract locale and path without locale
  const locale = pathname.split('/')[1]
  const pathWithoutLocale = '/' + pathname.split('/').slice(2).join('/')

  // Supabase session
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users away from protected routes
  const isProtected = protectedRoutes.some((route) => pathWithoutLocale.startsWith(route))
  if (isProtected && !user) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?next=${encodeURIComponent(pathname)}`, request.url)
    )
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = authRoutes.some((route) => pathWithoutLocale.startsWith(route))
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
