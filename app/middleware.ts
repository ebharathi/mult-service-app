import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_PATHS = [
  '/',
  '/auth/signin',
  '/api/auth',
  '/verify-email',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  
  if (token && token.email) {
    // Skip public paths
    if (PUBLIC_PATHS.filter((p) => p !== '/').some((p) =>pathname === p)) {
      return NextResponse.redirect(new URL('/', req.url))
    }

      return NextResponse.next()
    }
    else{
      // Skip public paths
      if (PUBLIC_PATHS.some((p) =>pathname === p)) {
        return NextResponse.next()
      }
      const signInUrl = new URL('/auth/signin', req.url);
      // Add the original URL as a callback URL
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }
}
export const config = {
  matcher: ['/((?!_next|.*\\..*|api/auth).*)'],
}


