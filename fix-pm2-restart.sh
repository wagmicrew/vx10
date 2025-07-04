#!/bin/bash

# Script to fix PM2 processes and restart the VX10 application on port 3000
# Run this on the Ubuntu server to fix the 502 Bad Gateway issue

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

# Function to stop all PM2 processes
stop_all_pm2() {
    log "Stopping all PM2 processes..."
    
    if command -v pm2 >/dev/null 2>&1; then
        # Stop all processes
        pm2 stop all || true
        
        # Delete all processes
        pm2 delete all || true
        
        # Clear PM2 logs
        pm2 flush || true
        
        log "All PM2 processes stopped and cleared"
    else
        error "PM2 is not installed or not found in PATH"
        return 1
    fi
}

# Function to check and install dependencies
check_dependencies() {
    local project_dir="$1"
    
    log "Checking project dependencies in $project_dir..."
    
    if [[ ! -f "$project_dir/package.json" ]]; then
        error "package.json not found in $project_dir"
        return 1
    fi
    
    cd "$project_dir"
    
    # Check if node_modules exists and is not empty
    if [[ ! -d "node_modules" ]] || [[ -z "$(ls -A node_modules 2>/dev/null)" ]]; then
        log "Installing dependencies..."
        npm ci
    else
        log "Dependencies already installed"
    fi
    
    # Check if build exists
    if [[ ! -d ".next" ]]; then
        log "Building project..."
        npm run build
    else
        log "Project already built"
    fi
}

# Function to create PM2 ecosystem file
create_ecosystem_file() {
    local project_dir="$1"
    local domain="${2:-dev.dintrafikskolahlm.se}"
    
    log "Creating PM2 ecosystem file..."
    
    cat > "$project_dir/ecosystem.config.js" <<EOF
module.exports = {
  apps: [{
    name: '$domain',
    script: 'npm',
    args: 'start',
    cwd: '$project_dir',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '$project_dir/logs/err.log',
    out_file: '$project_dir/logs/out.log',
    log_file: '$project_dir/logs/combined.log',
    time: true
  }]
};
EOF
    
    # Create logs directory
    mkdir -p "$project_dir/logs"
    
    log "PM2 ecosystem file created at $project_dir/ecosystem.config.js"
}

# Function to start the application with PM2
start_application() {
    local project_dir="$1"
    
    log "Starting application with PM2..."
    
    cd "$project_dir"
    
    # Start the application using ecosystem file
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    log "Application started with PM2"
}

# Function to verify application is running
verify_application() {
    local max_attempts=30
    local attempt=1
    
    log "Verifying application is running on port 3000..."
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            log "✅ Application is responding on port 3000!"
            return 0
        else
            info "Attempt $attempt/$max_attempts - Application not responding yet, waiting..."
            sleep 2
            ((attempt++))
        fi
    done
    
    error "❌ Application is not responding on port 3000 after $max_attempts attempts"
    return 1
}

# Function to check what's running on port 3000
check_port_3000() {
    log "Checking what's running on port 3000..."
    
    if command -v netstat >/dev/null 2>&1; then
        netstat -tlnp | grep :3000 || log "Nothing is listening on port 3000"
    elif command -v ss >/dev/null 2>&1; then
        ss -tlnp | grep :3000 || log "Nothing is listening on port 3000"
    else
        warning "netstat and ss commands not available"
    fi
}

# Function to show PM2 status and logs
show_pm2_info() {
    log "PM2 Status:"
    pm2 status || true
    
    log "Recent PM2 logs:"
    pm2 logs --lines 20 || true
}

# Main function
main() {
    log "Starting PM2 and application restart process..."
    
    # Determine project directory
    local project_dir
    if [[ -d "/var/www/vx10" ]]; then
        project_dir="/var/www/vx10"
    elif [[ -d "/var/www/html" ]]; then
        project_dir="/var/www/html"
    elif [[ "$PWD" == *"vx10"* ]]; then
        project_dir="$PWD"
    else
        error "Could not find VX10 project directory"
        exit 1
    fi
    
    log "Using project directory: $project_dir"
    
    # Check if directory exists and has required files
    if [[ ! -d "$project_dir" ]]; then
        error "Project directory $project_dir does not exist"
        exit 1
    fi
    
    # Stop all PM2 processes
    stop_all_pm2
    
    # Check port 3000 before starting
    check_port_3000
    
    # Check and install dependencies
    check_dependencies "$project_dir"
    
    # Create ecosystem file
    create_ecosystem_file "$project_dir"
    
    # Start application
    start_application "$project_dir"
    
    # Show PM2 information
    show_pm2_info
    
    # Verify application is running
    if verify_application; then
        log "🎉 Application successfully restarted and running on port 3000!"
        
        # Test with curl
        log "Testing application response..."
        curl -I http://localhost:3000 || warning "Could not get response headers"
        
        # Restart nginx to ensure proper proxy
        log "Restarting Nginx..."
        sudo systemctl restart nginx
        
        log "✅ All services restarted successfully!"
        info "Your application should now be accessible"
        
    else
        error "❌ Failed to start application properly"
        log "Checking PM2 logs for errors..."
        pm2 logs --lines 50
        exit 1
    fi
}

# Run main function
main "$@"
