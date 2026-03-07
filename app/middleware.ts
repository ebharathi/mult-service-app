import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = [
  '/',
  '/auth/signin',
  '/api/auth',
  '/invite/accept',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (token && token.email) {
    // Authenticated user visiting public auth pages → redirect to dashboard
    if (pathname === '/' || pathname === '/auth/signin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  } else {
    // Unauthenticated user
    if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith('/api/auth'))) {
      return NextResponse.next()
    }
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|api/auth).*)'],
}
