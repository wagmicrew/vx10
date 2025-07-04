#!/bin/bash

# Quick fix script for VX10 deployment directory issue
# Run this on the Ubuntu server to fix the current issue

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

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Fix the deployment directory issue
fix_deployment() {
    log "Fixing VX10 deployment directory issue..."
    
    # Set the project directory
    PROJECT_DIR="/var/www/vx10"
    
    # Create the directory if it doesn't exist
    if [[ ! -d "$PROJECT_DIR" ]]; then
        log "Creating project directory: $PROJECT_DIR"
        mkdir -p "$PROJECT_DIR"
        
        # Set proper ownership
        if [[ $EUID -eq 0 ]]; then
            # Create vx10 user if it doesn't exist
            if ! id "vx10" &>/dev/null; then
                log "Creating vx10 user..."
                useradd -m -s /bin/bash vx10
                usermod -aG sudo vx10
            fi
            chown vx10:vx10 "$PROJECT_DIR"
        else
            sudo mkdir -p "$PROJECT_DIR"
            sudo chown $USER:$USER "$PROJECT_DIR"
        fi
    fi
    
    # Navigate to the directory
    cd "$PROJECT_DIR"
    log "Successfully changed to directory: $PWD"
    
    # Check if git repository exists
    if [[ -d ".git" ]]; then
        log "Git repository found. Checking status..."
        git status
        
        # Pull latest changes
        log "Pulling latest changes..."
        git stash
        git fetch origin
        git checkout master
        git pull origin master
        
        # Install dependencies if package.json exists
        if [[ -f "package.json" ]]; then
            log "Installing dependencies..."
            npm ci
            
            log "Building project..."
            npm run build
            
            # Restart PM2 if it's running
            if command -v pm2 >/dev/null 2>&1; then
                log "Restarting PM2 processes..."
                pm2 restart all || true
                pm2 save
            fi
        fi
    else
        warning "No git repository found. You may need to clone the repository first."
        info "To clone the repository, run:"
        info "git clone https://github.com/wagmicrew/vx10.git ."
    fi
    
    log "Directory fix completed!"
    info "Current directory: $PWD"
    info "Directory contents:"
    ls -la
}

# Main function
main() {
    log "Starting VX10 deployment fix..."
    
    # Check if we're in the right place
    if [[ "$PWD" == *"vx10"* ]]; then
        log "Already in VX10 directory, checking status..."
        fix_deployment
    else
        # Try to navigate to the expected directory
        if [[ -d "/var/www/vx10" ]]; then
            cd "/var/www/vx10"
            fix_deployment
        else
            log "Creating and setting up VX10 directory..."
            fix_deployment
        fi
    fi
    
    log "Fix script completed successfully!"
}

# Run main function
main "$@"
