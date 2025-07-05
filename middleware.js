import { NextResponse } from 'next/server';

// Import our logger (need to use dynamic import for client-side compatibility)
let logger;
if (typeof window === 'undefined') {
  // Server-side only
  try {
    logger = require('./utils/logger').logger;
  } catch (error) {
    console.error('Failed to load logger:', error);
  }
}

export function middleware(request) {
  const start = Date.now();
  const { pathname, search } = request.nextUrl;
  const url = pathname + search;

  // Log the request if logger is available
  if (logger) {
    logger.info('Middleware Request', {
      method: request.method,
      url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date().toISOString()
    });
  }

  // Create response
  const response = NextResponse.next();

  // Add custom headers for debugging
  response.headers.set('X-VX10-Request-ID', generateRequestId());
  response.headers.set('X-VX10-Timestamp', new Date().toISOString());

  // Handle static file requests specifically
  if (pathname.startsWith('/_next/static/')) {
    // Log static file requests that might be failing
    if (logger) {
      logger.debug('Static file request', {
        path: pathname,
        method: request.method,
        userAgent: request.headers.get('user-agent')
      });
    }

    // Add cache headers for static files
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Check for potential routing issues
  if (pathname.includes('..') || pathname.includes('//')) {
    if (logger) {
      logger.warn('Suspicious path detected', {
        path: pathname,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent')
      });
    }
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Log completion time
  if (logger) {
    const duration = Date.now() - start;
    logger.debug('Middleware completed', {
      url,
      duration: `${duration}ms`,
      status: response.status
    });
  }

  return response;
}

function generateRequestId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
