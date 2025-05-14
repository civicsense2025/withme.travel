import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const pathname = request.nextUrl.pathname;

  // Check if this is an image request to the API routes
  if (
    pathname.startsWith('/api/destinations') &&
    pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|avif)$/i)
  ) {
    // Redirect image requests directly to static assets
    return NextResponse.redirect(new URL('/images/placeholder-destination.jpg', request.url));
  }

  // Handle null-prefixed slugs in the API
  if (
    pathname.startsWith('/api/destinations/by-slug/null') ||
    pathname.includes('/undefined') ||
    pathname.includes('/[object%20Object]')
  ) {
    // Redirect to a valid API endpoint
    const cleanPath = pathname.replace(/\/by-slug\/.*/, '/by-slug/placeholder');
    return NextResponse.redirect(new URL(cleanPath, request.url));
  }

  // Continue for all other requests
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/api/destinations/:path*'],
};
