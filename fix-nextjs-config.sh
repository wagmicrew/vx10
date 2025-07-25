#!/bin/bash

# Fix Next.js TypeScript Configuration Issue
# Converts next.config.ts to next.config.js for compatibility

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

# Function to fix Next.js config
fix_nextjs_config() {
    local project_dir="${1:-$(pwd)}"
    
    log "Checking Next.js configuration in: $project_dir"
    cd "$project_dir" || {
        error "Cannot access directory: $project_dir"
        return 1
    }
    
    # Check if next.config.ts exists
    if [[ -f "next.config.ts" ]]; then
        log "Found next.config.ts - converting to next.config.js for compatibility..."
        
        # Create backup
        cp next.config.ts "next.config.ts.backup.$(date +%Y%m%d_%H%M%S)"
        log "Created backup: next.config.ts.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Convert TypeScript config to JavaScript
        cp next.config.ts next.config.js
        
        # Remove TypeScript imports and type annotations
        sed -i 's/import type { NextConfig } from ['\''"]next['\''"]//g' next.config.js
        sed -i 's/import { NextConfig } from ['\''"]next['\''"]//g' next.config.js
        sed -i 's/: NextConfig//g' next.config.js
        sed -i 's/as NextConfig//g' next.config.js
        
        # Remove TypeScript-specific syntax
        sed -i 's/export default (\(.*\)) satisfies NextConfig/export default \1/g' next.config.js
        
        # Clean up any remaining TypeScript syntax
        sed -i 's/satisfies NextConfig//g' next.config.js
        
        # Remove the original TypeScript config
        rm next.config.ts
        
        success "Successfully converted next.config.ts to next.config.js"
        log "Original file backed up and TypeScript config removed"
        
    elif [[ -f "next.config.js" ]]; then
        success "next.config.js already exists - no conversion needed"
        
    elif [[ -f "next.config.mjs" ]]; then
        success "next.config.mjs exists - this should work fine with Next.js"
        
    else
        warning "No Next.js configuration file found"
        log "This might be a Next.js project without a custom configuration"
    fi
}

# Function to verify Next.js build
verify_nextjs_build() {
    local project_dir="${1:-$(pwd)}"
    
    cd "$project_dir" || return 1
    
    log "Verifying Next.js build..."
    
    # Check if package.json exists and has Next.js
    if [[ -f "package.json" ]] && grep -q "next" package.json; then
        log "Next.js project detected"
        
        # Try to run Next.js build
        if command -v npm >/dev/null 2>&1; then
            log "Testing Next.js configuration..."
            if timeout 30 npm run build --silent 2>/dev/null; then
                success "Next.js build completed successfully!"
            else
                warning "Next.js build still has issues. Check the configuration manually."
                error "You may need to review your next.config.js file for other TypeScript syntax."
            fi
        else
            warning "npm not found - cannot test build"
        fi
    else
        warning "This doesn't appear to be a Next.js project"
    fi
}

# Main function
main() {
    echo "========================================="
    echo "    Next.js TypeScript Config Fixer     "
    echo "========================================="
    echo
    
    local target_dir="${1:-$(pwd)}"
    
    if [[ ! -d "$target_dir" ]]; then
        error "Directory not found: $target_dir"
        echo "Usage: $0 [project_directory]"
        exit 1
    fi
    
    log "Fixing Next.js configuration in: $target_dir"
    
    fix_nextjs_config "$target_dir"
    verify_nextjs_build "$target_dir"
    
    echo
    success "Next.js configuration fix completed!"
    echo
    log "If you still have build issues, check for:"
    echo "  - Other TypeScript syntax in next.config.js"
    echo "  - Missing dependencies in package.json"
    echo "  - Custom TypeScript configurations that need manual conversion"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
