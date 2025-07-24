/**
 * Edge Runtime-Compatible VX10 Logger
 * Uses Next.js built-in logging capabilities and runtime detection
 */

// Runtime detection utility
function getRuntime() {
  try {
    // Check if we're in Edge Runtime
    if (typeof EdgeRuntime !== 'undefined') {
      return 'edge';
    }
    
    // Check for Node.js specific globals
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      return 'nodejs';
    }
    
    // Check for browser environment
    if (typeof window !== 'undefined') {
      return 'browser';
    }
    
    return 'unknown';
  } catch {
    return 'edge'; // Assume edge runtime if detection fails
  }
}

class EdgeCompatibleLogger {
  constructor() {
    this.runtime = getRuntime();
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      SUCCESS: 2 // Treat as INFO level
    };
    
    // Initialize based on runtime
    this.init();
  }

  init() {
    if (this.runtime === 'nodejs') {
      this.initNodeJS();
    } else {
      this.initEdgeRuntime();
    }
  }

  initNodeJS() {
    try {
      this.fs = require('fs');
      this.path = require('path');
      this.util = require('util');
      
      // Only set up file logging in Node.js
      this.logDir = this.path.join(process.cwd(), 'logs');
      this.ensureLogDirectory();
      this.currentDate = new Date().toISOString().split('T')[0];
      
      // Setup process handlers only in Node.js
      this.setupProcessHandlers();
    } catch (error) {
      console.warn('Failed to initialize Node.js logger features:', error.message);
    }
  }

  initEdgeRuntime() {
    // Edge Runtime doesn't support file system operations
    // Use console-only logging with structured output
    this.logDir = null;
    this.fs = null;
    this.path = null;
    
    // Create mock process object for edge runtime
    this.mockProcess = {
      pid: 'edge-runtime',
      memoryUsage: () => ({ rss: 0, heapTotal: 0, heapUsed: 0, external: 0 }),
      version: 'edge-runtime',
      platform: 'edge',
      arch: 'universal'
    };
  }

  ensureLogDirectory() {
    if (this.runtime === 'nodejs' && this.fs && this.path) {
      try {
        if (!this.fs.existsSync(this.logDir)) {
          this.fs.mkdirSync(this.logDir, { recursive: true });
        }
      } catch (error) {
        console.warn('Failed to create log directory:', error.message);
      }
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  getSystemInfo() {
    if (this.runtime === 'nodejs') {
      try {
        return {
          pid: process.pid,
          memory: process.memoryUsage(),
          version: process.version,
          platform: process.platform,
          arch: process.arch,
          runtime: 'nodejs'
        };
      } catch {
        return { runtime: 'nodejs-limited' };
      }
    } else {
      return {
        pid: this.mockProcess.pid,
        memory: this.mockProcess.memoryUsage(),
        version: this.mockProcess.version,
        platform: this.mockProcess.platform,
        arch: this.mockProcess.arch,
        runtime: 'edge'
      };
    }
  }

  formatMessage(level, message, extra = {}) {
    const logEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      ...this.getSystemInfo(),
      ...extra
    };

    return JSON.stringify(logEntry, null, 2);
  }

  writeToFile(filename, content) {
    if (this.runtime === 'nodejs' && this.fs && this.path) {
      try {
        const logFile = this.path.join(this.logDir, `${this.currentDate}-${filename}.log`);
        this.fs.appendFileSync(logFile, content + '\n');
      } catch (error) {
        console.warn('Failed to write to log file:', error.message);
      }
    }
    // Edge runtime: files are not supported, skip silently
  }

  writeToConsole(level, message, extra = {}) {
    const colors = {
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      INFO: '\x1b[36m',    // Cyan
      DEBUG: '\x1b[35m',   // Magenta
      SUCCESS: '\x1b[32m', // Green
      RESET: '\x1b[0m'
    };

    const timestamp = this.getTimestamp();
    
    // In Edge Runtime, use simpler logging
    if (this.runtime === 'edge') {
      const logData = {
        timestamp,
        level,
        message,
        runtime: 'edge',
        ...extra
      };

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
      return;
    }

    // Node.js: Use colored output
    const color = colors[level] || colors.RESET;
    console.log(`${color}[${timestamp}] ${level}:${colors.RESET} ${message}`);
    
    if (Object.keys(extra).length > 0) {
      if (this.util) {
        console.log(`${color}Extra:${colors.RESET}`, this.util.inspect(extra, { colors: true, depth: 3 }));
      } else {
        console.log(`${color}Extra:${colors.RESET}`, extra);
      }
    }
  }

  log(level, message, extra = {}) {
    // Always write to console
    this.writeToConsole(level, message, extra);
    
    // Only write to file in Node.js runtime
    if (this.runtime === 'nodejs') {
      const formattedMessage = this.formatMessage(level, message, extra);
      this.writeToFile('app', formattedMessage);
      
      // Write to specific error file if it's an error
      if (level === 'ERROR') {
        this.writeToFile('errors', formattedMessage);
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

  // Next.js API Route compatible logging
  logApiRequest(req, startTime) {
    const duration = Date.now() - startTime;
    
    // Extract safe request info (avoiding Node.js specific properties in edge)
    const requestInfo = {
      method: req.method,
      url: req.url,
      userAgent: req.headers?.['user-agent'],
      duration: `${duration}ms`
    };

    // Add Node.js specific info only if available
    if (this.runtime === 'nodejs') {
      requestInfo.ip = req.ip || req.socket?.remoteAddress;
    }

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

    // Include response data for errors
    if (res.status >= 400 || res.statusCode >= 400) {
      responseInfo.responseData = responseData;
    }

    const logLevel = (res.status >= 400 || res.statusCode >= 400) ? 'ERROR' : 'INFO';
    this.log(logLevel, 'API Response', responseInfo);
  }

  // Next.js middleware compatible logger
  nextMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.logApiRequest(req, start);

      // Override end method to capture response
      const originalEnd = res.end;
      res.end = (...args) => {
        this.logApiResponse(req, res, start);
        originalEnd.apply(res, args);
      };

      if (next) next();
    };
  }

  // Edge-compatible error handler
  handleError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...context
    };

    this.error('Application Error', errorInfo);
  }

  // Process handlers (Node.js only)
  setupProcessHandlers() {
    if (this.runtime !== 'nodejs') {
      return;
    }

    try {
      process.on('uncaughtException', (error) => {
        this.error('Uncaught Exception', {
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          }
        });
        process.exit(1);
      });

      process.on('unhandledRejection', (reason, promise) => {
        this.error('Unhandled Promise Rejection', {
          reason: reason?.message || reason,
          stack: reason?.stack,
          promise: promise.toString()
        });
      });

      process.on('SIGTERM', () => {
        this.info('Process termination signal received');
        process.exit(0);
      });

      process.on('SIGINT', () => {
        this.info('Process interrupt signal received');
        process.exit(0);
      });
    } catch (error) {
      console.warn('Failed to setup process handlers:', error.message);
    }
  }

  // Health check (runtime aware)
  async checkHealth() {
    const healthInfo = {
      runtime: this.runtime,
      timestamp: this.getTimestamp(),
      ...this.getSystemInfo()
    };

    if (this.runtime === 'nodejs') {
      try {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        healthInfo.detailedHealth = {
          memory: {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
          },
          cpu: {
            user: cpuUsage.user,
            system: cpuUsage.system
          },
          uptime: `${Math.round(process.uptime())}s`
        };
      } catch (error) {
        healthInfo.healthCheckError = error.message;
      }
    }

    this.info('Health Check', healthInfo);
    return healthInfo;
  }

  // Create logger for specific context
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

// Create singleton instance
const logger = new EdgeCompatibleLogger();

// Export both class and instance
export { EdgeCompatibleLogger, logger };
export default logger;

// Also provide CommonJS compatibility for existing imports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EdgeCompatibleLogger,
    logger
  };
}
