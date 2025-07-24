/**
 * Example API route demonstrating Edge Runtime-compatible logging
 * This can run in both Node.js and Edge Runtime
 */

import { logger } from '../../utils/edge-logger.js';

// This export enables Edge Runtime for this API route
// Remove this line to run in Node.js runtime
export const config = {
  runtime: 'edge', // or 'nodejs' (default)
};

export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    // Create a context-specific logger
    const contextLogger = logger.createContextLogger({
      api: 'example-edge-logger',
      userId: req.headers['x-user-id'] || 'anonymous'
    });

    // Log the incoming request
    contextLogger.info('Processing API request', {
      method: req.method,
      query: req.query,
      headers: Object.keys(req.headers)
    });

    // Simulate some processing
    if (req.method === 'GET') {
      // Health check endpoint
      if (req.url?.endsWith('/health')) {
        const healthInfo = await logger.checkHealth();
        
        contextLogger.success('Health check completed');
        
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          runtime: logger.runtime,
          health: healthInfo
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      // Default GET response
      contextLogger.info('Returning default GET response');
      
      return new Response(JSON.stringify({
        message: 'Edge-compatible logger working!',
        runtime: logger.runtime,
        timestamp: new Date().toISOString(),
        features: {
          fileLogging: logger.runtime === 'nodejs',
          consoleLogging: true,
          processHandlers: logger.runtime === 'nodejs',
          healthCheck: true
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    if (req.method === 'POST') {
      // Parse request body
      let body;
      try {
        body = await req.json();
      } catch (error) {
        contextLogger.error('Failed to parse request body', { error: error.message });
        
        return new Response(JSON.stringify({
          error: 'Invalid JSON in request body',
          timestamp: new Date().toISOString()
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      contextLogger.info('Processing POST request', { bodyKeys: Object.keys(body) });

      // Simulate processing the data
      if (body.action === 'test-error') {
        // Demonstrate error handling
        const error = new Error('Simulated error for testing');
        logger.handleError(error, { 
          action: body.action,
          requestId: req.headers['x-request-id'] 
        });

        return new Response(JSON.stringify({
          error: 'Simulated error occurred',
          timestamp: new Date().toISOString()
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      contextLogger.success('POST request processed successfully');

      return new Response(JSON.stringify({
        message: 'Data processed successfully',
        runtime: logger.runtime,
        data: body,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Method not allowed
    contextLogger.warn('Method not allowed', { method: req.method });
    
    return new Response(JSON.stringify({
      error: 'Method not allowed',
      allowedMethods: ['GET', 'POST'],
      timestamp: new Date().toISOString()
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Allow': 'GET, POST'
      }
    });

  } catch (error) {
    // Global error handling
    logger.handleError(error, {
      api: 'example-edge-logger',
      method: req.method,
      url: req.url
    });

    return new Response(JSON.stringify({
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } finally {
    // Log response time
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      api: 'example-edge-logger',
      duration: `${duration}ms`
    });
  }
}
