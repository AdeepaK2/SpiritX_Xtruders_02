import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define which paths are protected (require authentication)
  const isProtectedRoute = path.startsWith('/admin') && !path.includes('/admin/login')
  
  // Get the token from cookies
  const token = request.cookies.get('adminToken')?.value

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL('/admin/login', request.url)
    return NextResponse.redirect(url)
  }

  // If going to login page with valid token, redirect to admin dashboard
  if (path === '/admin/login' && token) {
    const url = new URL('/admin', request.url)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure which paths middleware will run on
export const config = {
  matcher: ['/admin/:path*']
}