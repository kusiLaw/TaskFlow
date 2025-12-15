import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value; // get the access token from cookies
  const { pathname } = request.nextUrl; // get the current path
  const publicRoutes = ['/login', '/register', '/invite', '/'];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route)); // check if the current path is a public route

  // If the user is not authenticated and tries to access a protected route (/dashboard), redirect to login
  if (!token && !isPublicRoute && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  // If the user is authenticated and tries to access login or register, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Apply the middleware to all routes except for API routes, static files, and the favicon
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};