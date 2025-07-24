import { NextResponse } from 'next/server';

// Simple console logger for middleware (Edge Runtime compatible)
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data),
  debug: (message, data) => console.log(`[DEBUG] ${message}`, data),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data),
  error: (message, data) => console.error(`[ERROR] ${message}`, data)
};

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
