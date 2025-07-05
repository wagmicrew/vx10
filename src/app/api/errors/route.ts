import { NextRequest, NextResponse } from 'next/server';

// Logger interface type
interface Logger {
  error: (message: string, data?: Record<string, unknown>) => void;
  warn: (message: string, data?: Record<string, unknown>) => void;
}

// Function to get logger dynamically
async function getLogger(): Promise<Logger | null> {
  try {
    // Use dynamic import for ES modules compatibility
    const loggerModule = await import('../../../../utils/logger');
    return loggerModule.logger;
  } catch (error) {
    console.error('Failed to load logger in API route:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();
    
    // Add request metadata
    const enrichedError = {
      ...errorData,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || 'unknown',
      timestamp: new Date().toISOString()
    }

    // Get logger instance
    const logger = await getLogger();

    // Log based on error type
    if (logger) {
      switch (errorData.type) {
        case 'network_error':
          logger.error('Client Network Error', enrichedError);
          break;
        case 'performance_issue':
          logger.warn('Performance Issue', enrichedError);
          break;
        case 'javascript_error':
        default:
          logger.error('Client JavaScript Error', enrichedError);
          break;
      }
    } else {
      // Fallback to console.error if logger not available
      console.error('Client Error (via API):', enrichedError);
    }

    // In production, you might want to store errors in database
    // or send to external monitoring service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Store in database
      // await prisma.errorLog.create({ data: enrichedError });
      
      // Example: Send to external service
      // await sendToSentry(enrichedError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Error logged successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Failed to process error report:', error);
    
    const logger = await getLogger();
    if (logger) {
      logger.error('Error processing error report', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Failed to log error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint for the error reporting system
  const searchParams = request.nextUrl.searchParams;
  const check = searchParams.get('check');

  if (check === 'health') {
    const logger = await getLogger();
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      logger: logger ? 'available' : 'unavailable'
    });
  }

  return NextResponse.json({
    message: 'VX10 Error Reporting API',
    endpoints: {
      'POST /api/errors': 'Submit error reports',
      'GET /api/errors?check=health': 'Health check'
    }
  });
}
