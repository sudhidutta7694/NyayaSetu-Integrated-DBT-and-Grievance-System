import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/login', '/']
const onboardingRoutes = ['/onboarding']
// All protected routes that require authentication and onboarding
const protectedRoutes = [
  '/dashboard', 
  '/applications',      // Covers /applications, /applications/new, /applications/[id]
  '/profile', 
  '/documents', 
  '/announcements'
]
const authorityRoutes = ['/district', '/social-welfare', '/admin', '/fi'] // Authority routes (no middleware check)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for authority routes (they use client-side mock auth)
  if (authorityRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // Public routes handling
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    // If user has token and tries to access login, redirect based on onboarding status
    if (token && pathname === '/login') {
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (userResponse.ok) {
          const user = await userResponse.json()
          
          // If not onboarded, send to onboarding
          if (!user.is_onboarded) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
          }
          
          // If onboarded, send to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
          // Token is invalid, clear it
          const response = NextResponse.next()
          response.cookies.delete('access_token')
          return response
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // On error, clear token and stay on login
        const response = NextResponse.next()
        response.cookies.delete('access_token')
        return response
      }
    }
    
    return NextResponse.next()
  }

  // All other routes require authentication
  // 1. Check if token exists
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Verify token validity on every request
  try {
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    // Token is invalid or expired
    if (!userResponse.ok) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('access_token')
      return response
    }

    const user = await userResponse.json()

    // 3. Handle onboarding route
    if (onboardingRoutes.some(route => pathname.startsWith(route))) {
      // If user is already onboarded, redirect to dashboard
      if (user.is_onboarded) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      // User is not onboarded, allow access to onboarding
      return NextResponse.next()
    }

    // 4. Handle protected routes (dashboard, applications, documents, profile, etc.)
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      // User must be onboarded to access these routes
      if (!user.is_onboarded) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      
      // User is onboarded and token is valid, allow access
      return NextResponse.next()
    }

    // Allow access to any other authenticated routes
    return NextResponse.next()

  } catch (error) {
    console.error('Token verification failed:', error)
    // On token verification error, redirect to login and clear token
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('access_token')
    return response
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
