import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ['/admin', '/teacher', '/student', '/api/admin']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/signin', req.url)
    redirectUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Role-based access control
  if (session && isProtectedRoute) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('supabaseId', session.user.id)
      .single()

    const userRole = user?.role || 'STUDENT'

    // Admin routes
    if (req.nextUrl.pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // Teacher routes
    if (req.nextUrl.pathname.startsWith('/teacher') && !['ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    // API admin routes
    if (req.nextUrl.pathname.startsWith('/api/admin') && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}