#!/bin/bash

# Fix Dependencies Script
# Installs missing dependencies and resolves build issues

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
    local critical_packages=("next" "react" "react-dom" "next-auth" "lucide-react" "@mui/material" "@mui/joy" "@mui/icons-material" "sonner")
    
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

# Function to generate necessary files
generate_files() {
    log "Generating necessary files..."
    
    # Generate Prisma client if schema exists
    if [[ -f "prisma/schema.prisma" ]]; then
        log "Generating Prisma client..."
        npx prisma generate
    fi
    
    # Create .env.local if it doesn't exist
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
