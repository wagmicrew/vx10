#!/bin/bash

# Fix Dependencies Script for Ubuntu
# Installs missing dependencies and resolves build issues
# Compatible with Ubuntu/Linux environments ONLY

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to check if running in correct directory
check_directory() {
    if [[ ! -f "package.json" ]]; then
        error "package.json not found. Please run this script from the project root directory."
        exit 1
    fi
    
    if [[ ! -f "next.config.js" ]] && [[ ! -f "next.config.ts" ]] && [[ ! -f "next.config.mjs" ]]; then
        warning "No Next.js config found. This might not be a Next.js project."
    fi
}

# Function to clean installation
clean_install() {
    log "Cleaning previous installation..."
    
    # Remove node_modules and lock files
    rm -rf node_modules package-lock.json yarn.lock pnpm-lock.yaml
    
    # Clear npm cache
    npm cache clean --force
    
    success "Cleaned previous installation"
}

# Function to install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Install all dependencies
    npm install
    
    success "Dependencies installed successfully"
}

# Function to verify installation
verify_installation() {
    log "Verifying installation..."
    
    # Check if critical packages are installed
    local critical_packages=("next" "react" "react-dom" "next-auth" "lucide-react" "@mui/material" "@mui/joy" "@mui/icons-material" "sonner" "date-fns" "framer-motion" "@fontsource/roboto")
    
    for package in "${critical_packages[@]}"; do
        if [[ -d "node_modules/$package" ]]; then
            log "✓ $package is installed"
        else
            error "✗ $package is missing"
            return 1
        fi
    done
    
    success "All critical packages are installed"
}

# Function to fix NextAuth getServerSession issues
fix_nextauth_issues() {
    log "Fixing NextAuth getServerSession issues..."
    
    # Fix the booking/create route.js to use proper NextAuth v5 syntax
    if [[ -f "src/app/api/booking/create/route.js" ]]; then
        log "Fixing getServerSession import in booking/create/route.js..."
        
        # Replace the import line and usage using more portable sed
        sed -i.bak 's/import { getServerSession } from '\''next-auth'\'';/import { auth } from "@\/lib\/auth\/config";/' src/app/api/booking/create/route.js
        sed -i.bak 's/const session = await getServerSession();/const session = await auth();/' src/app/api/booking/create/route.js
        
        success "Fixed getServerSession import in booking create route"
    fi
    
    # Create the auth export if it doesn't exist
    if [[ -f "src/lib/auth/config.ts" ]]; then
        log "Ensuring NextAuth v5 auth export exists..."
        
        # Check if auth export exists, if not, add it
        if ! grep -q "export.*auth" src/lib/auth/config.ts; then
            echo "" >> src/lib/auth/config.ts
            echo "// NextAuth v5 export" >> src/lib/auth/config.ts
            echo "export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);" >> src/lib/auth/config.ts
            success "Added NextAuth v5 auth export"
        fi
    fi
}

# Function to fix edge runtime issues
fix_edge_runtime_issues() {
    log "Fixing Edge Runtime compatibility issues..."
    
    # Create edge-safe version of logger
    if [[ -f "utils/edge-logger.js" ]]; then
        log "Creating edge-safe logger backup..."
        
        # Backup the current logger to a Node.js specific version
        cp utils/edge-logger.js utils/node-logger-backup.js
        
        # Use the new edge-safe logger if it exists
        if [[ -f "utils/edge-logger-safe.js" ]]; then
            log "Replacing edge-logger with safe version..."
            cp utils/edge-logger-safe.js utils/edge-logger.js
            success "Replaced edge-logger with safe version"
            return
        fi
        
        # Create a simplified edge-safe logger
        cat > utils/edge-logger.js << 'LOGGER_EOF'
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
}

const logger = new EdgeSafeLogger();

export { EdgeSafeLogger, logger };
export default logger;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EdgeSafeLogger, logger };
}
LOGGER_EOF
        success "Created edge-safe logger"
    fi
}

# Function to fix Prisma client issues
fix_prisma_issues() {
    log "Fixing Prisma client issues..."
    
    # Generate Prisma client if schema exists
    if [[ -f "prisma/schema.prisma" ]]; then
        log "Generating Prisma client..."
        npx prisma generate
        
        # Fix Prisma import paths in API routes
        log "Fixing Prisma import paths..."
        find src/app/api -name "*.js" -exec sed -i 's|from '\''@prisma/client'\''|from '\''../../../generated/prisma'\''|g' {} \;
        find src/app/api -name "*.js" -exec sed -i 's|from "@prisma/client"|from "../../../generated/prisma"|g' {} \;
        
        # Fix specific path for lessons route (different depth)
        if [[ -f "src/app/api/lessons/route.js" ]]; then
            sed -i 's|from '\''../../../generated/prisma'\''|from '\''../../generated/prisma'\''|g' src/app/api/lessons/route.js
        fi
        
        success "Prisma client generated and imports fixed"
    else
        warning "No Prisma schema found, skipping Prisma client generation"
    fi
}

generate_files() {
    log "Generating necessary files..."
    
    fix_nextauth_issues
    fix_edge_runtime_issues
    fix_prisma_issues
    
    if [[ ! -f ".env.local" ]] && [[ -f ".env.example" ]]; then
        log "Creating .env.local from .env.example..."
        cp .env.example .env.local
        warning "Please update .env.local with your actual environment variables"
    fi
    
    success "Files generated successfully"
}

# Function to test build
test_build() {
    log "Testing Next.js build..."
    
    # Try to build the project
    if npm run build; then
        success "Build completed successfully!"
        return 0
    else
        error "Build failed. Check the error messages above."
        return 1
    fi
}

# Function to provide troubleshooting tips
troubleshooting_tips() {
    echo
    warning "If you're still experiencing issues, try these troubleshooting steps:"
    echo
    echo "1. Check Node.js version (should be 18+ for Next.js 15):"
    echo "   node --version"
    echo
    echo "2. Clear all caches and reinstall:"
    echo "   rm -rf node_modules package-lock.json .next"
    echo "   npm cache clean --force"
    echo "   npm install"
    echo
    echo "3. Check for TypeScript errors:"
    echo "   npx tsc --noEmit"
    echo
    echo "4. Update Next.js config if you have next.config.ts:"
    echo "   Consider renaming to next.config.js for compatibility"
    echo
    echo "5. Check for missing environment variables in .env.local"
    echo
    echo "6. If using authentication, ensure NextAuth.js is properly configured"
    echo
}

# Main function
main() {
    echo "================================================"
    echo "    VX10 Dependencies Fix Script              "
    echo "================================================"
    echo
    
    check_directory
    
    log "Starting dependency fix process..."
    
    # Ask user for confirmation
    read -p "This will clean and reinstall all dependencies. Continue? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log "Operation cancelled by user"
        exit 0
    fi
    
    # Execute fix steps
    clean_install
    install_dependencies
    verify_installation
    generate_files
    
    echo
    log "Testing build..."
    if test_build; then
        echo
        success "🎉 All dependencies fixed and build successful!"
        echo
        log "You can now run:"
        echo "  npm run dev    - Start development server"
        echo "  npm run build  - Build for production"
        echo "  npm run start  - Start production server"
    else
        echo
        error "❌ Build failed. See troubleshooting tips below:"
        troubleshooting_tips
        exit 1
    fi
}

# Run main function
main "$@"
