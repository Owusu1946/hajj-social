import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user's role from profile if logged in
  let userRole = null
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    userRole = profile?.role
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup']
  
  // If user is not signed in and trying to access protected route
  if (!session && !publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and trying to access auth routes
  if (session && publicRoutes.includes(req.nextUrl.pathname)) {
    const defaultPath = userRole ? `/${userRole}/dashboard` : '/dashboard'
    return NextResponse.redirect(new URL(defaultPath, req.url))
  }

  // Redirect to role-specific dashboard if accessing /dashboard
  if (session && req.nextUrl.pathname === '/dashboard') {
    const dashboardPath = userRole ? `/${userRole}/dashboard` : '/dashboard'
    return NextResponse.redirect(new URL(dashboardPath, req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
}