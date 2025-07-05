const fs = require('fs');
const path = require('path');
const util = require('util');

class VX10Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    this.currentDate = new Date().toISOString().split('T')[0];
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, extra = {}) {
    return JSON.stringify({
      timestamp: this.getTimestamp(),
      level,
      message,
      pid: process.pid,
      memory: process.memoryUsage(),
      ...extra
    }, null, 2);
  }

  writeToFile(filename, content) {
    const logFile = path.join(this.logDir, `${this.currentDate}-${filename}.log`);
    fs.appendFileSync(logFile, content + '\n');
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

    const color = colors[level] || colors.RESET;
    const timestamp = this.getTimestamp();
    
    console.log(`${color}[${timestamp}] ${level}:${colors.RESET} ${message}`);
    
    if (Object.keys(extra).length > 0) {
      console.log(`${color}Extra:${colors.RESET}`, util.inspect(extra, { colors: true, depth: 3 }));
    }
  }

  log(level, message, extra = {}) {
    const formattedMessage = this.formatMessage(level, message, extra);
    
    // Write to console
    this.writeToConsole(level, message, extra);
    
    // Write to file
    this.writeToFile('app', formattedMessage);
    
    // Write to specific error file if it's an error
    if (level === 'ERROR') {
      this.writeToFile('errors', formattedMessage);
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

  // HTTP Request logging middleware
  httpLogger() {
    return (req, res, next) => {
      const start = Date.now();
      const originalSend = res.send;

      // Log request
      this.info('HTTP Request', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        body: req.method === 'POST' ? req.body : undefined
      });

      // Override res.send to capture response
      res.send = function(body) {
        const duration = Date.now() - start;
        const logger = req.app.locals.logger || new VX10Logger();
        
        const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
        logger.log(logLevel, 'HTTP Response', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          contentLength: body ? body.length : 0,
          responseBody: res.statusCode >= 400 ? body : undefined
        });

        originalSend.call(this, body);
      };

      next();
    };
  }

  // Next.js specific error handler
  nextErrorHandler() {
    return (err, req, res, next) => {
      this.error('Next.js Error', {
        error: {
          message: err.message,
          stack: err.stack,
          name: err.name
        },
        request: {
          method: req.method,
          url: req.url,
          headers: req.headers
        },
        timestamp: this.getTimestamp()
      });

      // Continue with default error handling
      next(err);
    };
  }

  // Process error handlers
  setupProcessHandlers() {
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
  }

  // Check build and chunk files
  async checkBuildIntegrity() {
    const buildDir = path.join(process.cwd(), '.next');
    const chunksDir = path.join(buildDir, 'static', 'chunks');

    this.info('Checking build integrity...');

    try {
      if (!fs.existsSync(buildDir)) {
        this.error('Build directory not found', { buildDir });
        return false;
      }

      if (!fs.existsSync(chunksDir)) {
        this.error('Chunks directory not found', { chunksDir });
        return false;
      }

      const chunks = fs.readdirSync(chunksDir);
      this.info('Build chunks found', { 
        chunksCount: chunks.length,
        chunks: chunks.slice(0, 10) // Log first 10 chunks
      });

      // Check for corrupted files
      const corruptedFiles = [];
      for (const chunk of chunks) {
        const chunkPath = path.join(chunksDir, chunk);
        try {
          const stats = fs.statSync(chunkPath);
          if (stats.size === 0) {
            corruptedFiles.push(chunk);
          }
        } catch (error) {
          corruptedFiles.push(chunk);
          this.error('Error reading chunk file', { chunk, error: error.message });
        }
      }

      if (corruptedFiles.length > 0) {
        this.error('Corrupted chunk files detected', { corruptedFiles });
        return false;
      }

      this.success('Build integrity check passed');
      return true;
    } catch (error) {
      this.error('Build integrity check failed', { error: error.message });
      return false;
    }
  }

  // Check server health
  async checkServerHealth() {
    this.info('Checking server health...');
    
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      this.info('Server health status', {
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
        uptime: `${Math.round(process.uptime())}s`,
        version: process.version,
        platform: process.platform,
        arch: process.arch
      });

      return true;
    } catch (error) {
      this.error('Server health check failed', { error: error.message });
      return false;
    }
  }

  // Generate daily report
  generateDailyReport() {
    const today = new Date().toISOString().split('T')[0];
    const errorLogFile = path.join(this.logDir, `${today}-errors.log`);
    const appLogFile = path.join(this.logDir, `${today}-app.log`);

    let report = {
      date: today,
      errors: [],
      warnings: [],
      requests: 0,
      errorRequests: 0
    };

    try {
      if (fs.existsSync(errorLogFile)) {
        const errorLogs = fs.readFileSync(errorLogFile, 'utf8');
        const errorLines = errorLogs.split('\n').filter(line => line.trim());
        report.errors = errorLines.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        });
      }

      if (fs.existsSync(appLogFile)) {
        const appLogs = fs.readFileSync(appLogFile, 'utf8');
        const appLines = appLogs.split('\n').filter(line => line.trim());
        
        appLines.forEach(line => {
          try {
            const log = JSON.parse(line);
            if (log.message === 'HTTP Request') {
              report.requests++;
            }
            if (log.message === 'HTTP Response' && log.statusCode >= 400) {
              report.errorRequests++;
            }
            if (log.level === 'WARN') {
              report.warnings.push(log);
            }
          } catch {
            // Skip invalid JSON lines
          }
        });
      }

      this.info('Daily report generated', report);
      this.writeToFile('reports', JSON.stringify(report, null, 2));
      
      return report;
    } catch (error) {
      this.error('Failed to generate daily report', { error: error.message });
      return null;
    }
  }
}

// Create singleton instance
const logger = new VX10Logger();

// Setup global error handlers
logger.setupProcessHandlers();

module.exports = {
  VX10Logger,
  logger
};
