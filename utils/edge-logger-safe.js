/**
 * Edge Runtime-Safe Logger for VX10
 * Simplified version that works in both Edge and Node.js environments
 */

class EdgeSafeLogger {
  constructor() {
    this.isEdgeRuntime = typeof EdgeRuntime !== 'undefined';
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, extra = {}) {
    const logEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      runtime: this.isEdgeRuntime ? 'edge' : 'nodejs',
      ...extra
    };
    return JSON.stringify(logEntry, null, 2);
  }

  log(level, message, extra = {}) {
    const timestamp = this.getTimestamp();
    const colors = {
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      INFO: '\x1b[36m',
      DEBUG: '\x1b[35m',
      SUCCESS: '\x1b[32m',
      RESET: '\x1b[0m'
    };

    if (this.isEdgeRuntime) {
      switch (level) {
        case 'ERROR':
          console.error(`[${timestamp}] ERROR: ${message}`, extra);
          break;
        case 'WARN':
          console.warn(`[${timestamp}] WARN: ${message}`, extra);
          break;
        case 'DEBUG':
          console.debug(`[${timestamp}] DEBUG: ${message}`, extra);
          break;
        default:
          console.log(`[${timestamp}] ${level}: ${message}`, extra);
      }
    } else {
      const color = colors[level] || colors.RESET;
      console.log(`${color}[${timestamp}] ${level}:${colors.RESET} ${message}`);
      if (Object.keys(extra).length > 0) {
        console.log(`${color}Extra:${colors.RESET}`, extra);
      }
    }
  }

  error(message, extra = {}) {
    this.log('ERROR', message, extra);
  }

  warn(message, extra = {}) {
    this.log('WARN', message, extra);
  }

  info(message, extra = {}) {
    this.log('INFO', message, extra);
  }

  debug(message, extra = {}) {
    this.log('DEBUG', message, extra);
  }

  success(message, extra = {}) {
    this.log('SUCCESS', message, extra);
  }

  // API logging methods for compatibility
  logApiRequest(req, startTime) {
    const duration = Date.now() - startTime;
    
    const requestInfo = {
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
      duration: `${duration}ms`
    };

    this.info('API Request', requestInfo);
  }

  logApiResponse(req, res, startTime, responseData = null) {
    const duration = Date.now() - startTime;
    
    const responseInfo = {
      method: req.method,
      url: req.url,
      statusCode: res.status || res.statusCode,
      duration: `${duration}ms`
    };

    if (res.status >= 400 || res.statusCode >= 400) {
      responseInfo.responseData = responseData;
    }

    const logLevel = (res.status >= 400 || res.statusCode >= 400) ? 'ERROR' : 'INFO';
    this.log(logLevel, 'API Response', responseInfo);
  }

  handleError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...context
    };

    this.error('Application Error', errorInfo);
  }

  createContextLogger(context) {
    return {
      error: (message, extra = {}) => this.error(message, { ...extra, context }),
      warn: (message, extra = {}) => this.warn(message, { ...extra, context }),
      info: (message, extra = {}) => this.info(message, { ...extra, context }),
      debug: (message, extra = {}) => this.debug(message, { ...extra, context }),
      success: (message, extra = {}) => this.success(message, { ...extra, context })
    };
  }
}

const logger = new EdgeSafeLogger();

export { EdgeSafeLogger, logger };
export default logger;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EdgeSafeLogger, logger };
}
