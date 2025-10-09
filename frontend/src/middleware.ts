import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/login', '/']
const onboardingRoutes = ['/onboarding']
const protectedRoutes = ['/dashboard', '/applications', '/profile', '/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const token = request.cookies.get('access_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    if (token && pathname === '/login') {
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (userResponse.ok) {
          const user = await userResponse.json()
          
          if (!user.is_onboarded) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
          }
          
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } catch (error) {
      }
    }
    
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!userResponse.ok) {
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('access_token')
      return response
    }

    const user = await userResponse.json()

    if (onboardingRoutes.some(route => pathname.startsWith(route))) {
      if (user.is_onboarded) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      return NextResponse.next()
    }

    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      if (!user.is_onboarded) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      
      return NextResponse.next()
    }

    return NextResponse.next()

  } catch (error) {
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
