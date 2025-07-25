#!/bin/bash

# Din Trafikskola HLM Admin Script for Ubuntu
# Author: Din Trafikskola HLM Team
# Description: Comprehensive admin script for managing Din Trafikskola HLM deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Configuration
DEFAULT_PROJECT_DIR="/var/www/din-trafikskola-hlm"
LOG_DIR="/var/log/din-trafikskola-hlm"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# Global variables
DEPLOY_USER=""
DEPLOY_HOME=""
IS_ROOT=false
CURRENT_DIR=""

# Logging functions
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

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if running with sudo
check_sudo() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run with sudo"
        error "Please run: sudo $0"
        exit 1
    fi
}

# Setup user context
setup_user_context() {
    # Get the actual user who called sudo
    if [[ -n "$SUDO_USER" ]]; then
        DEPLOY_USER="$SUDO_USER"
        DEPLOY_HOME=$(eval echo ~$SUDO_USER)
    else
        DEPLOY_USER="$USER"
        DEPLOY_HOME="$HOME"
    fi
    
    # Get current directory
    CURRENT_DIR="$(pwd)"
    
    IS_ROOT=true
    
    log "Deploy user: $DEPLOY_USER"
    log "Deploy home: $DEPLOY_HOME"
    log "Current directory: $CURRENT_DIR"
}

# Execute command as deploy user
execute_as_user() {
    local cmd="$1"
    sudo -u "$DEPLOY_USER" bash -c "cd '$CURRENT_DIR' && $cmd"
}

# Fix git ownership
fix_git_ownership() {
    local dir="${1:-$CURRENT_DIR}"
    if [[ -d "$dir/.git" ]]; then
        log "Fixing git ownership for $dir..."
        chown -R "$DEPLOY_USER:$DEPLOY_USER" "$dir/.git"
        sudo -u "$DEPLOY_USER" git config --global --add safe.directory "$dir"
        success "Git ownership fixed"
    fi
}

# Fix permissions for project directory
fix_permissions() {
    local dir="${1:-$CURRENT_DIR}"
    log "Fixing permissions for $dir..."
    
    # Set ownership
    chown -R "$DEPLOY_USER:www-data" "$dir"
    
    # Set directory permissions
    find "$dir" -type d -exec chmod 755 {} \;
    
    # Set file permissions
    find "$dir" -type f -exec chmod 644 {} \;
    
    # Make scripts executable
    find "$dir" -name "*.sh" -exec chmod +x {} \;
    
    # Special permissions for .next and node_modules
    if [[ -d "$dir/.next" ]]; then
        chmod -R 755 "$dir/.next"
    fi
    
    if [[ -d "$dir/node_modules/.bin" ]]; then
        chmod -R 755 "$dir/node_modules/.bin"
    fi
    
    success "Permissions fixed"
}

# Clear screen function that works in different environments
clear_screen() {
    clear 2>/dev/null || printf '\033c'
}

# Press enter to continue
press_enter() {
    echo
    read -p "Press Enter to continue..."
}

# Menu header
show_header() {
    local title="$1"
    clear_screen
    echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
    printf "${CYAN}║${NC} %-42s ${CYAN}║${NC}\n" "$title"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
    echo
}

# Check prerequisites
check_prerequisites() {
    local missing_tools=()
    
    # Essential tools
    local essential=("git" "node" "npm" "curl" "wget" "jq")
    for tool in "${essential[@]}"; do
        if ! command_exists "$tool"; then
            missing_tools+=("$tool")
        fi
    done
    
    # Check for PM2
    if ! execute_as_user "command -v pm2" >/dev/null 2>&1; then
        warning "PM2 not installed for user $DEPLOY_USER"
    fi
    
    # Check for PostgreSQL
    if ! command_exists "psql"; then
        warning "PostgreSQL client not installed"
    fi
    
    # Check for Nginx
    if ! command_exists "nginx"; then
        warning "Nginx not installed"
    fi
    
    # Report missing tools
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        error "Missing essential tools: ${missing_tools[*]}"
        echo "Install with: sudo apt-get install ${missing_tools[*]}"
        exit 1
    fi
}

# GitHub Operations Menu
github_menu() {
    while true; do
        show_header "GitHub Operations"
        echo "1) Pull latest changes"
        echo "2) Show git status"
        echo "3) Show recent commits"
        echo "4) Switch branch"
        echo "5) Create new branch"
        echo "6) Push changes"
        echo "7) Back to main menu"
        echo
        read -p "Select option [1-7]: " choice
        
        case $choice in
            1) github_pull ;;
            2) github_status ;;
            3) github_log ;;
            4) github_switch_branch ;;
            5) github_create_branch ;;
            6) github_push ;;
            7) break ;;
            *) error "Invalid option" ;;
        esac
    done
}

# GitHub functions
github_pull() {
    fix_git_ownership
    log "Pulling latest changes..."
    execute_as_user "git pull"
    success "Pull completed"
    press_enter
}

github_status() {
    fix_git_ownership
    log "Git status:"
    execute_as_user "git status"
    press_enter
}

github_log() {
    fix_git_ownership
    log "Recent commits:"
    execute_as_user "git log --oneline -10"
    press_enter
}

github_switch_branch() {
    fix_git_ownership
    echo "Available branches:"
    execute_as_user "git branch -a"
    echo
    read -p "Enter branch name: " branch
    if [[ -n "$branch" ]]; then
        execute_as_user "git checkout $branch"
        success "Switched to branch $branch"
    fi
    press_enter
}

github_create_branch() {
    fix_git_ownership
    read -p "Enter new branch name: " branch
    if [[ -n "$branch" ]]; then
        execute_as_user "git checkout -b $branch"
        success "Created and switched to branch $branch"
    fi
    press_enter
}

github_push() {
    fix_git_ownership
    log "Pushing changes..."
    execute_as_user "git push"
    success "Push completed"
    press_enter
}

# Node.js Management Menu
node_menu() {
    while true; do
        show_header "Node.js Management"
        echo "1) Install dependencies"
        echo "2) Build production"
        echo "3) Build development"
        echo "4) Start development server"
        echo "5) Run tests"
        echo "6) Clear cache"
        echo "7) Fix permissions"
        echo "8) Back to main menu"
        echo
        read -p "Select option [1-8]: " choice
        
        case $choice in
            1) node_install ;;
            2) node_build_prod ;;
            3) node_build_dev ;;
            4) node_start_dev ;;
            5) node_test ;;
            6) node_clear_cache ;;
            7) fix_permissions ;;
            8) break ;;
            *) error "Invalid option" ;;
        esac
    done
}

# Node.js functions
node_install() {
    log "Installing dependencies..."
    execute_as_user "npm install"
    success "Dependencies installed"
    press_enter
}

node_build_prod() {
    log "Building for production..."
    execute_as_user "npm run build"
    success "Production build completed"
    press_enter
}

node_build_dev() {
    log "Building for development..."
    execute_as_user "npm run build:dev || npm run build"
    success "Development build completed"
    press_enter
}

node_start_dev() {
    log "Starting development server..."
    log "Press Ctrl+C to stop"
    execute_as_user "npm run dev"
    press_enter
}

node_test() {
    log "Running tests..."
    execute_as_user "npm test || echo 'No tests configured'"
    press_enter
}

node_clear_cache() {
    log "Clearing cache..."
    rm -rf .next/cache
    execute_as_user "npm cache clean --force"
    success "Cache cleared"
    press_enter
}

# PM2 Management Menu
pm2_menu() {
    while true; do
        show_header "PM2 Process Management"
        echo "1) Show status"
        echo "2) Start application"
        echo "3) Stop application"
        echo "4) Restart application"
        echo "5) View logs"
        echo "6) Save configuration"
        echo "7) Back to main menu"
        echo
        read -p "Select option [1-7]: " choice
        
        case $choice in
            1) pm2_status ;;
            2) pm2_start ;;
            3) pm2_stop ;;
            4) pm2_restart ;;
            5) pm2_logs ;;
            6) pm2_save ;;
            7) break ;;
            *) error "Invalid option" ;;
        esac
    done
}

# PM2 functions
pm2_status() {
    log "PM2 status:"
    execute_as_user "pm2 status"
    press_enter
}

pm2_start() {
    log "Starting application with PM2..."
    execute_as_user "pm2 start ecosystem.config.js || pm2 start npm --name 'din-trafikskola' -- start"
    success "Application started"
    press_enter
}

pm2_stop() {
    log "Stopping application..."
    execute_as_user "pm2 stop all"
    success "Application stopped"
    press_enter
}

pm2_restart() {
    log "Restarting application..."
    execute_as_user "pm2 restart all"
    success "Application restarted"
    press_enter
}

pm2_logs() {
    log "PM2 logs (Press Ctrl+C to exit):"
    execute_as_user "pm2 logs"
    press_enter
}

pm2_save() {
    log "Saving PM2 configuration..."
    execute_as_user "pm2 save"
    systemctl enable pm2-$DEPLOY_USER
    success "PM2 configuration saved"
    press_enter
}

# Nginx Management Menu
nginx_menu() {
    while true; do
        show_header "Nginx Web Server"
        echo "1) Show status"
        echo "2) Start Nginx"
        echo "3) Stop Nginx"
        echo "4) Restart Nginx"
        echo "5) Reload configuration"
        echo "6) Test configuration"
        echo "7) Edit site configuration"
        echo "8) View logs"
        echo "9) Back to main menu"
        echo
        read -p "Select option [1-9]: " choice
        
        case $choice in
            1) nginx_status ;;
            2) nginx_start ;;
            3) nginx_stop ;;
            4) nginx_restart ;;
            5) nginx_reload ;;
            6) nginx_test ;;
            7) nginx_edit_config ;;
            8) nginx_logs ;;
            9) break ;;
            *) error "Invalid option" ;;
        esac
    done
}

# Nginx functions
nginx_status() {
    log "Nginx status:"
    systemctl status nginx
    press_enter
}

nginx_start() {
    log "Starting Nginx..."
    systemctl start nginx
    success "Nginx started"
    press_enter
}

nginx_stop() {
    log "Stopping Nginx..."
    systemctl stop nginx
    success "Nginx stopped"
    press_enter
}

nginx_restart() {
    log "Restarting Nginx..."
    systemctl restart nginx
    success "Nginx restarted"
    press_enter
}

nginx_reload() {
    log "Reloading Nginx configuration..."
    nginx -t && systemctl reload nginx
    success "Nginx configuration reloaded"
    press_enter
}

nginx_test() {
    log "Testing Nginx configuration..."
    nginx -t
    press_enter
}

nginx_edit_config() {
    local site_name="din-trafikskola-hlm"
    local config_file="$NGINX_SITES_AVAILABLE/$site_name"
    
    if [[ -f "$config_file" ]]; then
        log "Editing $config_file"
        nano "$config_file"
        nginx_test
    else
        error "Configuration file not found: $config_file"
    fi
    press_enter
}

nginx_logs() {
    log "Nginx logs (last 50 lines):"
    echo "=== Error Log ==="
    tail -50 /var/log/nginx/error.log
    echo
    echo "=== Access Log ==="
    tail -20 /var/log/nginx/access.log
    press_enter
}

# Update Deployment Function
update_deployment() {
    show_header "Update Deployment"
    
    warning "This will update the live site with code from: $CURRENT_DIR"
    echo "Target directory: $DEFAULT_PROJECT_DIR"
    echo
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        info "Update cancelled"
        press_enter
        return
    fi
    
    log "Starting deployment update..."
    
    # Step 1: Stop the current application
    info "Stopping current application..."
    execute_as_user "pm2 stop all" || true
    
    # Step 2: Backup current deployment
    if [[ -d "$DEFAULT_PROJECT_DIR" ]]; then
        local backup_dir="/var/backups/din-trafikskola-hlm-$(date +%Y%m%d-%H%M%S)"
        info "Creating backup at $backup_dir..."
        mkdir -p "$backup_dir"
        cp -r "$DEFAULT_PROJECT_DIR"/{.env,.env.local,uploads,public/uploads} "$backup_dir/" 2>/dev/null || true
    fi
    
    # Step 3: Sync files from current directory to deployment directory
    info "Syncing files..."
    mkdir -p "$DEFAULT_PROJECT_DIR"
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' \
        --exclude='logs' --exclude='uploads' --exclude='.env*' \
        "$CURRENT_DIR/" "$DEFAULT_PROJECT_DIR/"
    
    # Step 4: Copy environment files if they don't exist
    if [[ -f "$CURRENT_DIR/.env" ]] && [[ ! -f "$DEFAULT_PROJECT_DIR/.env" ]]; then
        cp "$CURRENT_DIR/.env" "$DEFAULT_PROJECT_DIR/"
    fi
    if [[ -f "$CURRENT_DIR/.env.local" ]] && [[ ! -f "$DEFAULT_PROJECT_DIR/.env.local" ]]; then
        cp "$CURRENT_DIR/.env.local" "$DEFAULT_PROJECT_DIR/"
    fi
    
    # Step 5: Fix ownership and permissions
    info "Fixing permissions..."
    chown -R "$DEPLOY_USER:www-data" "$DEFAULT_PROJECT_DIR"
    fix_permissions "$DEFAULT_PROJECT_DIR"
    
    # Step 6: Install dependencies in deployment directory
    info "Installing dependencies..."
    cd "$DEFAULT_PROJECT_DIR"
    execute_as_user "npm install --production"
    
    # Step 7: Build the application
    info "Building application..."
    execute_as_user "npm run build"
    
    # Step 8: Run database migrations if needed
    if [[ -f "$DEFAULT_PROJECT_DIR/prisma/schema.prisma" ]]; then
        info "Running database migrations..."
        execute_as_user "npx prisma migrate deploy" || true
    fi
    
    # Step 9: Update Nginx configuration if needed
    local nginx_config="$NGINX_SITES_AVAILABLE/din-trafikskola-hlm"
    if [[ ! -f "$nginx_config" ]]; then
        info "Creating Nginx configuration..."
        cat > "$nginx_config" << 'EOF'
server {
    listen 80;
    server_name din-trafikskola-hlm.com www.din-trafikskola-hlm.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /_next/static {
        alias /var/www/din-trafikskola-hlm/.next/static;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias /var/www/din-trafikskola-hlm/public/uploads;
        expires 30d;
        add_header Cache-Control "public";
    }
}
EOF
        ln -sf "$nginx_config" "$NGINX_SITES_ENABLED/"
        nginx -t && systemctl reload nginx
    fi
    
    # Step 10: Start the application
    info "Starting application..."
    cd "$DEFAULT_PROJECT_DIR"
    execute_as_user "pm2 start ecosystem.config.js || pm2 start npm --name 'din-trafikskola' -- start"
    execute_as_user "pm2 save"
    
    # Step 11: Ensure PM2 starts on boot
    info "Configuring PM2 startup..."
    pm2 startup systemd -u "$DEPLOY_USER" --hp "$DEPLOY_HOME"
    systemctl enable pm2-$DEPLOY_USER
    
    success "Deployment update completed!"
    echo
    echo "Site is now running from: $DEFAULT_PROJECT_DIR"
    echo "You can check the status with: pm2 status"
    echo
    
    # Return to original directory
    cd "$CURRENT_DIR"
    press_enter
}

# Utilities Menu
utilities_menu() {
    while true; do
        show_header "Utilities"
        echo "1) Update deployment from current directory"
        echo "2) View system information"
        echo "3) Check disk usage"
        echo "4) Search logs"
        echo "5) Create database backup"
        echo "6) Back to main menu"
        echo
        read -p "Select option [1-6]: " choice
        
        case $choice in
            1) update_deployment ;;
            2) system_info ;;
            3) disk_usage ;;
            4) search_logs ;;
            5) backup_database ;;
            6) break ;;
            *) error "Invalid option" ;;
        esac
    done
}

# Utility functions
system_info() {
    show_header "System Information"
    echo "Hostname: $(hostname)"
    echo "OS: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "Uptime: $(uptime -p)"
    echo
    echo "CPU: $(grep -c processor /proc/cpuinfo) cores"
    echo "Memory: $(free -h | grep Mem | awk '{print $2}')"
    echo "Disk: $(df -h / | tail -1 | awk '{print $4}' | tr -d '\n') free"
    echo
    echo "Node.js: $(node -v 2>/dev/null || echo 'not installed')"
    echo "NPM: $(npm -v 2>/dev/null || echo 'not installed')"
    echo "PM2: $(execute_as_user 'pm2 -v' 2>/dev/null || echo 'not installed')"
    echo
    press_enter
}

disk_usage() {
    show_header "Disk Usage"
    df -h
    echo
    echo "Largest directories in /var/www:"
    du -sh /var/www/* 2>/dev/null | sort -hr | head -10
    press_enter
}

search_logs() {
    read -p "Enter search term: " term
    if [[ -n "$term" ]]; then
        log "Searching for: $term"
        echo
        echo "=== PM2 Logs ==="
        execute_as_user "pm2 logs --nostream | grep -i '$term' | tail -20" || true
        echo
        echo "=== Nginx Logs ==="
        grep -i "$term" /var/log/nginx/*.log 2>/dev/null | tail -20 || true
        echo
    fi
    press_enter
}

backup_database() {
    log "Creating database backup..."
    read -p "Database name (default: trafikskoladb): " db_name
    db_name=${db_name:-trafikskoladb}
    read -p "Database user (default: trafikskolauser): " db_user
    db_user=${db_user:-trafikskolauser}
    
    local backup_file="/var/backups/trafikskola-db-$(date +%Y%m%d-%H%M%S).sql"
    
    if sudo -u postgres pg_dump "$db_name" > "$backup_file"; then
        success "Backup created: $backup_file"
        chmod 600 "$backup_file"
    else
        error "Backup failed"
    fi
    press_enter
}

# Main menu
main_menu() {
    while true; do
        show_header "Din Trafikskola HLM Admin Panel"
        echo "Current directory: $CURRENT_DIR"
        echo "Deploy user: $DEPLOY_USER"
        echo
        echo "1) GitHub Operations"
        echo "2) Node.js Management"
        echo "3) PM2 Process Management"
        echo "4) Nginx Web Server"
        echo "5) Utilities & Deployment"
        echo "6) Exit"
        echo
        read -p "Select option [1-6]: " choice
        
        case $choice in
            1) github_menu ;;
            2) node_menu ;;
            3) pm2_menu ;;
            4) nginx_menu ;;
            5) utilities_menu ;;
            6) 
                success "Thank you for using Din Trafikskola HLM Admin Panel!"
                exit 0
                ;;
            *) error "Invalid option" ;;
        esac
    done
}

# Main execution
main() {
    check_sudo
    setup_user_context
    check_prerequisites
    main_menu
}

# Run main function
main "$@"
