#!/bin/bash

# Function to clear cache
clear_cache() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    log "Clearing Next.js cache..."
    rm -rf .next/cache
    
    log "Clearing npm cache..."
    npm cache clean --force
    success "Cache cleared"
    read -p "Press Enter to continue..."
}

# Function to install or reinstall dependencies
reinstall_dependencies() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"

    log "Installing/reinstalling dependencies..."
    rm -rf node_modules package-lock.json
    npm ci
    success "Dependencies installed"
    read -p "Press Enter to continue..."
}

# Function to restart the application
restart_application() {
    log "Restarting application..."
    pm2 restart all
    success "Application restarted"
    read -p "Press Enter to continue..."
}

# Function to pull from a specific branch and build
github_pull_specific_branch() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    read -p "Enter branch name to pull from: " branch_name
    if [[ -z "$branch_name" ]]; then
        error "No branch name entered"
        return 1
    fi
    
    log "Pulling from branch $branch_name..."
    git fetch origin
    git checkout "$branch_name" || git checkout -b "$branch_name"
    git pull origin "$branch_name"
    
    log "Installing dependencies..."
    npm ci
    
    log "Building project..."
    npm run build
    
    success "Pulled and built from branch $branch_name"
    read -p "Press Enter to continue..."
}

# Function to setup database
setup_database() {
    local db_choice
    read -p "Use local PostgreSQL (1) or Supabase (2)? Enter 1 or 2: " db_choice
    if [[ "$db_choice" == "1" ]]; then
        info "Setting up local PostgreSQL..."
        # Assumes Ubuntu with PostgreSQL
        if ! command_exists psql; then
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
        fi
        log "Creating database and user..."
        sudo -u postgres psql -c "CREATE DATABASE vx10db;"
        sudo -u postgres psql -c "CREATE USER vx10user WITH ENCRYPTED PASSWORD 'vx10pass';"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vx10db TO vx10user;"
        success "Local PostgreSQL setup completed"
    elif [[ "$db_choice" == "2" ]]; then
        info "Configuring Supabase..."
        # Placeholder for Supabase setup
        warning "Supabase setup is not implemented in this script yet."
    else
        error "Invalid choice"
        return 1
    fi
    read -p "Press Enter to continue..."
}


# VX10 Admin Script for Ubuntu
# Author: VX10 Team
# Description: Comprehensive admin script for managing VX10 deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DEFAULT_PROJECT_DIR="/var/www/vx10"
LOG_DIR="/var/log/vx10"

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

# Enhanced user context setup with better error handling
setup_user_context() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. Will use vx10 user context."
        
        # Check if vx10 user exists, create if not
        if ! id "vx10" &>/dev/null; then
            log "Creating vx10 user..."
            useradd -m -s /bin/bash vx10
            usermod -aG sudo vx10
        fi
        
        DEPLOY_USER="vx10"
        DEPLOY_HOME="/home/vx10"
        IS_ROOT=true
        
        # Check if Node.js is available system-wide first
        if command -v node &>/dev/null; then
            log "Node.js already available system-wide: $(node --version)"
        else
            log "Node.js not found. Please install Node.js manually."
            warning "You can install it with: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
        fi
        
        # Check if PM2 is available for vx10 user
        if sudo -u vx10 bash -c 'command -v pm2' &>/dev/null; then
            log "PM2 already available for vx10 user"
        else
            log "PM2 not found for vx10 user. Will install if needed."
        fi
        
    else
        DEPLOY_USER="$USER"
        DEPLOY_HOME="$HOME"
        IS_ROOT=false
    fi

    log "Using deploy user: $DEPLOY_USER"
    log "Deploy home: $DEPLOY_HOME"
    
    # Fix permissions function - work with current directory
    fix_permissions() {
        local current_dir="$(pwd)"
        if [[ -d "$current_dir" ]]; then
            log "Fixing permissions for $current_dir..."
            sudo chown -R www-data:www-data "$current_dir" 2>/dev/null || true
            sudo find "$current_dir" -type d -exec chmod 755 {} \; 2>/dev/null || true
            sudo find "$current_dir" -type f -exec chmod 644 {} \; 2>/dev/null || true
            # Ensure vx10 user can still work with the files
            sudo chmod -R g+w "$current_dir" 2>/dev/null || true
            if id "vx10" &>/dev/null; then
                sudo usermod -aG www-data vx10 2>/dev/null || true
            fi
            log "Fixed permissions for $current_dir"
        fi
    }
    
    fix_permissions
}

# Function to get project directory
get_project_dir() {
    if [[ -f "/etc/vx10/config" ]]; then
        source /etc/vx10/config
        echo "${PROJECT_DIR:-$DEFAULT_PROJECT_DIR}"
    else
        echo "$DEFAULT_PROJECT_DIR"
    fi
}

# Function to save project directory
save_project_dir() {
    local dir="$1"
    sudo mkdir -p /etc/vx10
    echo "PROJECT_DIR=$dir" | sudo tee /etc/vx10/config > /dev/null
}

# Function to prompt for project directory
prompt_project_dir() {
    local current_dir=$(pwd)
    echo "$current_dir"
}

# GitHub Management Functions
github_menu() {
    while true; do
        clear
        echo -e "${MAGENTA}================================${NC}"
        echo -e "${MAGENTA}     VX10 GitHub Management     ${NC}"
        echo -e "${MAGENTA}================================${NC}"
        echo
        echo "1) Pull latest changes"
        echo "2) Pull and build"
        echo "3) Stash and pull"
        echo "4) Push and pull (with merge)"
        echo "5) Force pull (reset hard)"
        echo "6) Pull from specific branch"
        echo "7) View git status"
        echo "8) View git log"
        echo "9) Switch branch"
        echo "10) Create new branch"
        echo "11) View remotes"
        echo "12) Back to main menu"
        echo
        read -p "Select option [1-12]: " choice
        
        case $choice in
            1) github_pull ;;
            2) github_pull_build ;;
            3) github_stash_pull ;;
            4) github_push_pull ;;
            5) github_force_pull ;;
            6) github_pull_specific_branch ;;
            7) github_status ;;
            8) github_log ;;
            9) github_switch_branch ;;
            10) github_create_branch ;;
            11) github_remotes ;;
            12) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

# User context wrapper function
execute_with_user() {
    local command="$1"
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "$command"
    else
        eval "$command"
    fi
}

github_pull() {
    local project_dir=$(pwd)
    log "Pulling latest changes from current directory: $project_dir"
    
    if [[ ! -d ".git" ]]; then
        error "Current directory is not a git repository"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    git fetch origin && git pull origin $(git branch --show-current)
    success "Successfully pulled latest changes"
    read -p "Press Enter to continue..."
}

github_pull_build() {
    local project_dir=$(prompt_project_dir)
    log "Pulling latest changes and building..."
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    execute_with_user "cd '$project_dir' && git fetch origin && git pull origin \$(git branch --show-current)"
    
    log "Installing dependencies..."
    execute_with_user "cd '$project_dir' && npm ci"
    
    log "Building project..."
    execute_with_user "cd '$project_dir' && npm run build"
    
    log "Restarting PM2 processes..."
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "pm2 restart all"
    else
        pm2 restart all
    fi
    
    success "Successfully pulled and built project"
    read -p "Press Enter to continue..."
}

github_stash_pull() {
    local project_dir=$(prompt_project_dir)
    log "Stashing changes and pulling..."
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    execute_with_user "cd '$project_dir' && git stash push -m 'Auto-stash before pull \$(date)' && git fetch origin && git pull origin \$(git branch --show-current)"
    
    success "Successfully stashed and pulled"
    warning "Your local changes are stashed. Use 'git stash pop' to restore them."
    read -p "Press Enter to continue..."
}

# New function for push and pull with merge handling
github_push_pull() {
    local project_dir=$(prompt_project_dir)
    log "Checking for local changes and syncing with remote..."
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    execute_with_user "cd '$project_dir' && git fetch origin"
    
    # Check if there are local changes
    local has_changes=$(execute_with_user "cd '$project_dir' && git status --porcelain")
    local current_branch=$(execute_with_user "cd '$project_dir' && git branch --show-current")
    
    if [[ -n "$has_changes" ]]; then
        log "Local changes detected. Committing changes..."
        read -p "Enter commit message: " commit_msg
        if [[ -z "$commit_msg" ]]; then
            commit_msg="Auto-commit: $(date)"
        fi
        execute_with_user "cd '$project_dir' && git add . && git commit -m '$commit_msg'"
    fi
    
    # Check if remote has changes
    local remote_changes=$(execute_with_user "cd '$project_dir' && git rev-list HEAD..origin/$current_branch --count")
    
    if [[ "$remote_changes" -gt 0 ]]; then
        log "Remote changes detected. Attempting to pull with merge..."
        if ! execute_with_user "cd '$project_dir' && git pull origin $current_branch"; then
            error "Merge conflicts detected. Please resolve manually."
            read -p "Press Enter to continue..."
            return 1
        fi
    fi
    
    # Push if there are local commits
    local local_changes=$(execute_with_user "cd '$project_dir' && git rev-list origin/$current_branch..HEAD --count")
    
    if [[ "$local_changes" -gt 0 ]] || [[ -n "$has_changes" ]]; then
        log "Pushing local changes..."
        execute_with_user "cd '$project_dir' && git push origin $current_branch"
    fi
    
    success "Successfully synchronized with remote repository"
    read -p "Press Enter to continue..."
}

# New function for force pull (reset hard)
github_force_pull() {
    local project_dir=$(prompt_project_dir)
    warning "This will discard all local changes and force pull from remote!"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        if [[ ! -d "$project_dir" ]]; then
            error "Directory does not exist: $project_dir"
            read -p "Press Enter to continue..."
            return 1
        fi
        
        log "Force pulling from remote (discarding local changes)..."
        local current_branch=$(execute_with_user "cd '$project_dir' && git branch --show-current")
        
        execute_with_user "cd '$project_dir' && git fetch origin && git reset --hard origin/$current_branch"
        
        success "Successfully force pulled from remote"
    else
        info "Operation cancelled"
    fi
    read -p "Press Enter to continue..."
}

github_status() {
    local project_dir=$(prompt_project_dir)
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    cd "$project_dir"
    git status
    read -p "Press Enter to continue..."
}

github_log() {
    local project_dir=$(prompt_project_dir)
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    cd "$project_dir"
    git log --oneline -10
    read -p "Press Enter to continue..."
}

github_switch_branch() {
    local project_dir=$(prompt_project_dir)
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    cd "$project_dir"
    
    echo "Available branches:"
    git branch -a
    echo
    read -p "Enter branch name to switch to: " branch_name
    
    if [[ -n "$branch_name" ]]; then
        git checkout "$branch_name"
        success "Switched to branch: $branch_name"
    fi
    read -p "Press Enter to continue..."
}

github_create_branch() {
    local project_dir=$(prompt_project_dir)
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    cd "$project_dir"
    
    read -p "Enter new branch name: " branch_name
    if [[ -n "$branch_name" ]]; then
        git checkout -b "$branch_name"
        success "Created and switched to branch: $branch_name"
    fi
    read -p "Press Enter to continue..."
}

github_remotes() {
    local project_dir=$(prompt_project_dir)
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    cd "$project_dir"
    git remote -v
    read -p "Press Enter to continue..."
}

# PM2 Management Functions
pm2_menu() {
    while true; do
        clear
        echo -e "${CYAN}================================${NC}"
        echo -e "${CYAN}      VX10 PM2 Management       ${NC}"
        echo -e "${CYAN}================================${NC}"
        echo
        echo "1) Show PM2 status"
        echo "2) Restart all processes"
        echo "3) Restart specific process"
        echo "4) Stop all processes"
        echo "5) Stop specific process"
        echo "6) View logs (all)"
        echo "7) View logs (specific process)"
        echo "8) Monitor processes"
        echo "9) Delete all processes"
        echo "10) Show PM2 info"
        echo "11) Back to main menu"
        echo
        read -p "Select option [1-11]: " choice
        
        case $choice in
            1) pm2_status ;;
            2) pm2_restart_all ;;
            3) pm2_restart_specific ;;
            4) pm2_stop_all ;;
            5) pm2_stop_specific ;;
            6) pm2_logs_all ;;
            7) pm2_logs_specific ;;
            8) pm2_monitor ;;
            9) pm2_delete_all ;;
            10) pm2_info ;;
            11) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

pm2_status() {
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "pm2 status"
    else
        pm2 status
    fi
    read -p "Press Enter to continue..."
}

pm2_restart_all() {
    log "Restarting all PM2 processes..."
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "pm2 restart all"
    else
        pm2 restart all
    fi
    success "All processes restarted"
    read -p "Press Enter to continue..."
}

pm2_restart_specific() {
    pm2 list
    echo
    read -p "Enter process name or ID to restart: " process_name
    if [[ -n "$process_name" ]]; then
        pm2 restart "$process_name"
        success "Process $process_name restarted"
    fi
    read -p "Press Enter to continue..."
}

pm2_stop_all() {
    log "Stopping all PM2 processes..."
    pm2 stop all
    success "All processes stopped"
    read -p "Press Enter to continue..."
}

pm2_stop_specific() {
    pm2 list
    echo
    read -p "Enter process name or ID to stop: " process_name
    if [[ -n "$process_name" ]]; then
        pm2 stop "$process_name"
        success "Process $process_name stopped"
    fi
    read -p "Press Enter to continue..."
}

pm2_logs_all() {
    log "Showing PM2 logs (Press Ctrl+C to exit)..."
    pm2 logs
}

pm2_logs_specific() {
    pm2 list
    echo
    read -p "Enter process name or ID to view logs: " process_name
    if [[ -n "$process_name" ]]; then
        log "Showing logs for $process_name (Press Ctrl+C to exit)..."
        pm2 logs "$process_name"
    fi
}

pm2_monitor() {
    log "Opening PM2 monitor (Press q to exit)..."
    pm2 monit
}

pm2_delete_all() {
    warning "This will delete all PM2 processes!"
    read -p "Are you sure? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        pm2 delete all
        success "All processes deleted"
    fi
    read -p "Press Enter to continue..."
}

pm2_info() {
    pm2 list
    echo
    read -p "Enter process name or ID for detailed info: " process_name
    if [[ -n "$process_name" ]]; then
        pm2 show "$process_name"
    fi
    read -p "Press Enter to continue..."
}

# Node.js Management Functions
node_menu() {
    while true; do
        clear
        echo -e "${BLUE}================================${NC}"
        echo -e "${BLUE}     VX10 Node.js Management    ${NC}"
        echo -e "${BLUE}================================${NC}"
        echo
        echo "1) Check dependencies"
        echo "2) Install dependencies"
        echo "3) Update dependencies"
        echo "4) Audit dependencies"
        echo "5) Clean cache"
        echo "6) Clean node_modules and reinstall"
        echo "7) Build project"
        echo "8) Run tests"
        echo "9) Check Node.js version"
        echo "10) Back to main menu"
        echo
        read -p "Select option [1-10]: " choice
        
        case $choice in
            1) node_check_deps ;;
            2) node_install_deps ;;
            3) node_update_deps ;;
            4) node_audit_deps ;;
            5) node_clean_cache ;;
            6) node_clean_reinstall ;;
            7) node_build ;;
            8) node_test ;;
            9) node_version ;;
            10) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

node_check_deps() {
    local project_dir=$(prompt_project_dir)
    
    log "Checking dependencies..."
    execute_with_user "cd '$project_dir' && npm list --depth=0"
    read -p "Press Enter to continue..."
}

node_install_deps() {
    local project_dir=$(prompt_project_dir)
    
    log "Installing dependencies..."
    execute_with_user "cd '$project_dir' && npm ci"
    success "Dependencies installed"
    read -p "Press Enter to continue..."
}

node_update_deps() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    log "Updating dependencies..."
    npm update
    success "Dependencies updated"
    read -p "Press Enter to continue..."
}

node_audit_deps() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    log "Auditing dependencies..."
    npm audit
    echo
    read -p "Fix vulnerabilities automatically? (y/N): " fix_vulns
    if [[ "$fix_vulns" =~ ^[Yy]$ ]]; then
        npm audit fix
    fi
    read -p "Press Enter to continue..."
}

node_clean_cache() {
    log "Cleaning npm cache..."
    npm cache clean --force
    success "Cache cleaned"
    read -p "Press Enter to continue..."
}

node_clean_reinstall() {
    local project_dir=$(prompt_project_dir)
    
    warning "This will delete node_modules and package-lock.json!"
    read -p "Are you sure? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        log "Cleaning node_modules..."
        execute_with_user "cd '$project_dir' && rm -rf node_modules package-lock.json"
        
        log "Reinstalling dependencies..."
        execute_with_user "cd '$project_dir' && npm install"
        
        # Fix permissions after install
        fix_permissions
        
        success "Clean reinstall completed"
    fi
    read -p "Press Enter to continue..."
}

node_build() {
    local project_dir=$(prompt_project_dir)
    
    log "Building project..."
    execute_with_user "cd '$project_dir' && npm run build"
    
    # Fix permissions after build
    fix_permissions
    
    success "Build completed"
    read -p "Press Enter to continue..."
}

node_test() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    log "Running tests..."
    npm test
    read -p "Press Enter to continue..."
}

node_version() {
    log "Node.js version: $(node --version)"
    log "npm version: $(npm --version)"
    read -p "Press Enter to continue..."
}

# Redis Management Functions
redis_menu() {
    while true; do
        clear
        echo -e "${RED}================================${NC}"
        echo -e "${RED}     VX10 Redis Management      ${NC}"
        echo -e "${RED}================================${NC}"
        echo
        echo "1) Install Redis"
        echo "2) Start Redis"
        echo "3) Stop Redis"
        echo "4) Restart Redis"
        echo "5) Redis status"
        echo "6) Redis CLI"
        echo "7) Flush all Redis data"
        echo "8) View Redis config"
        echo "9) Redis info"
        echo "10) Back to main menu"
        echo
        read -p "Select option [1-10]: " choice
        
        case $choice in
            1) redis_install ;;
            2) redis_start ;;
            3) redis_stop ;;
            4) redis_restart ;;
            5) redis_status ;;
            6) redis_cli ;;
            7) redis_flush ;;
            8) redis_config ;;
            9) redis_info ;;
            10) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

redis_install() {
    if command_exists redis-server; then
        info "Redis is already installed"
    else
        log "Installing Redis..."
        sudo apt-get update
        sudo apt-get install -y redis-server
        
        # Configure Redis
        sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
        sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
        
        sudo systemctl enable redis-server
        sudo systemctl start redis-server
        
        success "Redis installed and configured"
    fi
    read -p "Press Enter to continue..."
}

redis_start() {
    log "Starting Redis..."
    sudo systemctl start redis-server
    success "Redis started"
    read -p "Press Enter to continue..."
}

redis_stop() {
    log "Stopping Redis..."
    sudo systemctl stop redis-server
    success "Redis stopped"
    read -p "Press Enter to continue..."
}

redis_restart() {
    log "Restarting Redis..."
    sudo systemctl restart redis-server
    success "Redis restarted"
    read -p "Press Enter to continue..."
}

redis_status() {
    sudo systemctl status redis-server
    read -p "Press Enter to continue..."
}

redis_cli() {
    log "Opening Redis CLI (type 'exit' to quit)..."
    redis-cli
}

redis_flush() {
    warning "This will delete all Redis data!"
    read -p "Are you sure? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        redis-cli FLUSHALL
        success "Redis data flushed"
    fi
    read -p "Press Enter to continue..."
}

redis_config() {
    sudo cat /etc/redis/redis.conf | grep -v "^#" | grep -v "^$"
    read -p "Press Enter to continue..."
}

redis_info() {
    redis-cli INFO
    read -p "Press Enter to continue..."
}

# Log Viewer Functions
logs_menu() {
    while true; do
        clear
        echo -e "${YELLOW}================================${NC}"
        echo -e "${YELLOW}     VX10 Log Viewer            ${NC}"
        echo -e "${YELLOW}================================${NC}"
        echo
        echo "1) PM2 logs"
        echo "2) Nginx access logs"
        echo "3) Nginx error logs"
        echo "4) System logs"
        echo "5) Application logs"
        echo "6) Real-time log monitoring"
        echo "7) Search logs"
        echo "8) Clear logs"
        echo "9) Back to main menu"
        echo
        read -p "Select option [1-9]: " choice
        
        case $choice in
            1) logs_pm2 ;;
            2) logs_nginx_access ;;
            3) logs_nginx_error ;;
            4) logs_system ;;
            5) logs_application ;;
            6) logs_realtime ;;
            7) logs_search ;;
            8) logs_clear ;;
            9) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

logs_pm2() {
    echo "1) All PM2 logs"
    echo "2) Specific process logs"
    read -p "Select [1-2]: " choice
    
    case $choice in
        1) pm2 logs ;;
        2) 
            pm2 list
            read -p "Enter process name: " process_name
            if [[ -n "$process_name" ]]; then
                pm2 logs "$process_name"
            fi
            ;;
    esac
}

logs_nginx_access() {
    log "Showing Nginx access logs (Press Ctrl+C to exit)..."
    sudo tail -f /var/log/nginx/access.log
}

logs_nginx_error() {
    log "Showing Nginx error logs (Press Ctrl+C to exit)..."
    sudo tail -f /var/log/nginx/error.log
}

logs_system() {
    log "Showing system logs (Press Ctrl+C to exit)..."
    sudo journalctl -f
}

logs_application() {
    local project_dir=$(get_project_dir)
    local log_file="$project_dir/logs/application.log"
    
    if [[ -f "$log_file" ]]; then
        log "Showing application logs (Press Ctrl+C to exit)..."
        tail -f "$log_file"
    else
        error "Application log file not found: $log_file"
    fi
    read -p "Press Enter to continue..."
}

logs_realtime() {
    log "Real-time log monitoring (Press Ctrl+C to exit)..."
    sudo multitail /var/log/nginx/access.log /var/log/nginx/error.log -I ~/.pm2/logs/*.log
}

logs_search() {
    read -p "Enter search term: " search_term
    if [[ -n "$search_term" ]]; then
        log "Searching logs for: $search_term"
        echo
        echo "=== PM2 Logs ==="
        find ~/.pm2/logs -name "*.log" -exec grep -H "$search_term" {} \; 2>/dev/null || true
        
        echo
        echo "=== Nginx Logs ==="
        sudo grep "$search_term" /var/log/nginx/*.log 2>/dev/null || true
        
        echo
        echo "=== System Logs ==="
        sudo journalctl --no-pager | grep "$search_term" | tail -20 || true
    fi
    read -p "Press Enter to continue..."
}

logs_clear() {
    warning "This will clear various log files!"
    read -p "Are you sure? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        log "Clearing PM2 logs..."
        pm2 flush
        
        log "Clearing Nginx logs..."
        sudo truncate -s 0 /var/log/nginx/access.log
        sudo truncate -s 0 /var/log/nginx/error.log
        
        success "Logs cleared"
    fi
    read -p "Press Enter to continue..."
}

# Utilities Menu
utilities_menu() {
    while true; do
        clear
        echo -e "${YELLOW}================================${NC}"
        echo -e "${YELLOW}       VX10 Utilities           ${NC}"
        echo -e "${YELLOW}================================${NC}"
        echo
        echo "1) Clear cache"
        echo "2) Reinstall dependencies"
        echo "3) Restart application"
        echo "4) Setup database"
        echo "5) Quick fix permissions"
        echo "6) Full fix permissions"
        echo "7) Diagnose and fix issues"
        echo "8) Check disk space"
        echo "9) Check process status"
        echo "10) Back to main menu"
        echo
        read -p "Select option [1-10]: " choice
        
        case $choice in
            1) clear_cache ;;
            2) reinstall_dependencies ;;
            3) restart_application ;;
            4) setup_database ;;
            5) quick_fix_permissions ;;
            6) full_fix_permissions ;;
            7) diagnose_and_fix ;;
            8) check_disk_space ;;
            9) check_process_status ;;
            10) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

# Add utility functions
check_disk_space() {
    log "Checking disk space..."
    df -h .
    echo
    log "Directory sizes:"
    du -sh */ 2>/dev/null | sort -hr | head -10
    read -p "Press Enter to continue..."
}

check_process_status() {
    log "Checking process status..."
    echo "=== PM2 Processes ==="
    if [[ $IS_ROOT == true ]]; then
        sudo -u "$DEPLOY_USER" pm2 status 2>/dev/null || echo "No PM2 processes found"
    else
        pm2 status 2>/dev/null || echo "No PM2 processes found"
    fi
    
    echo
    echo "=== Port Usage ==="
    netstat -tlnp | grep -E ':(3000|80|443)' 2>/dev/null || echo "No processes on common ports"
    
    read -p "Press Enter to continue..."
}

# Add a quick permissions fix function for utilities menu
quick_fix_permissions() {
    local current_dir="$(pwd)"
    log "Quick permission fix for current directory..."
    
    # Basic ownership fix
    sudo chown "$DEPLOY_USER:www-data" "$current_dir" 2>/dev/null || true
    
    # Fix only the most critical files
    sudo chown "$DEPLOY_USER:www-data" "$current_dir"/{package.json,package-lock.json,.env*,next.config.js,ecosystem.config.js} 2>/dev/null || true
    
    # Make sure the user can read/write
    sudo chmod 755 "$current_dir" 2>/dev/null || true
    
    success "Quick permissions fixed"
    read -p "Press Enter to continue..."
}

# Add a full permissions fix function for when needed
full_fix_permissions() {
    local current_dir="$(pwd)"
    warning "This will fix permissions for ALL files and may take time!"
    read -p "Continue? (y/N): " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        log "Fixing all permissions (this may take a while)..."
        
        # Full recursive fix
        sudo chown -R "$DEPLOY_USER:www-data" "$current_dir" 2>/dev/null || true
        sudo find "$current_dir" -type d -exec chmod 755 {} \; 2>/dev/null || true
        sudo find "$current_dir" -type f -exec chmod 644 {} \; 2>/dev/null || true
        
        # Make scripts executable
        sudo find "$current_dir" -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
        
        success "All permissions fixed"
    fi
    read -p "Press Enter to continue..."
}

# Add a function to check and fix common issues
diagnose_and_fix() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    log "Running diagnostics and fixes..."
    
    # Fix git ownership
    fix_git_ownership "$project_dir"
    
    # Check package.json
    if [[ ! -f "package.json" ]]; then
        error "package.json not found!"
        return 1
    fi
    
    # Check if node_modules exists and is not empty
    if [[ ! -d "node_modules" ]] || [[ -z "$(ls -A node_modules 2>/dev/null)" ]]; then
        log "node_modules missing or empty, installing..."
        execute_with_user "cd '$project_dir' && npm install"
    fi
    
    # Check if .next exists
    if [[ ! -d ".next" ]]; then
        log ".next directory missing, building..."
        execute_with_user "cd '$project_dir' && npm run build"
    fi
    
    # Check PM2 processes
    if [[ $IS_ROOT == true ]]; then
        local pm2_status=$(runuser -l "$DEPLOY_USER" -c "pm2 status" 2>/dev/null | grep -c "online" || echo "0")
    else
        local pm2_status=$(pm2 status 2>/dev/null | grep -c "online" || echo "0")
    fi
    
    if [[ "$pm2_status" -eq 0 ]]; then
        log "No PM2 processes running, starting application..."
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "cd '$project_dir' && pm2 start ecosystem.config.js"
        else
            cd "$project_dir" && pm2 start ecosystem.config.js
        fi
    fi
    
    # Fix permissions
    fix_permissions
    
    success "Diagnostics and fixes completed!"
    read -p "Press Enter to continue..."
}

# Add a comprehensive setup function for new installations
setup_project_from_scratch() {
    local project_dir=$(prompt_project_dir)
    
    log "Setting up project from scratch in $project_dir..."
    
    # Create directory if it doesn't exist
    if [[ ! -d "$project_dir" ]]; then
        log "Creating project directory..."
        sudo mkdir -p "$project_dir"
        sudo chown "$DEPLOY_USER:www-data" "$project_dir"
    fi
    
    cd "$project_dir"
    
    # Check if it's already a git repository
    if [[ ! -d ".git" ]]; then
        log "Initializing git repository..."
        read -p "Enter GitHub repository URL: " repo_url
        if [[ -n "$repo_url" ]]; then
            execute_with_user "cd '$project_dir' && git clone '$repo_url' ."
        else
            error "No repository URL provided"
            return 1
        fi
    fi
    
    # Fix git ownership
    fix_git_ownership "$project_dir"
    
    # Install dependencies
    log "Installing dependencies..."
    if [[ -f "package.json" ]]; then
        execute_with_user "cd '$project_dir' && npm install"
    else
        error "No package.json found in repository"
        return 1
    fi
    
    # Generate Prisma client if schema exists
    if [[ -f "prisma/schema.prisma" ]]; then
        log "Generating Prisma client..."
        execute_with_user "cd '$project_dir' && npm run prisma:generate"
    fi
    
    # Build project
    log "Building project..."
    execute_with_user "cd '$project_dir' && npm run build"
    
    # Fix final permissions
    fix_permissions
    
    success "Project setup completed!"
    read -p "Press Enter to continue..."
}

# Main Menu
main_menu() {
    while true; do
        clear
        echo -e "${GREEN}================================${NC}"
        echo -e "${GREEN}        VX10 Admin Panel        ${NC}"
        echo -e "${GREEN}================================${NC}"
        echo
        echo "1) GitHub Management"
        echo "2) Node.js Management"
        echo "3) PM2 Management"
        echo "4) Nginx Management"
        echo "5) Database Management"
        echo "6) Utilities"
        echo "7) System Information"
        echo "8) Setup project from scratch"
        echo "9) Exit"
        echo
        read -p "Select option [1-9]: " choice
        
        case $choice in
            1) github_menu ;;
            2) node_menu ;;
            3) pm2_menu ;;
            4) nginx_menu ;;
            5) database_menu ;;
            6) utilities_menu ;;
            7) system_info ;;
            8) setup_project_from_scratch ;;
            9) 
                log "Goodbye!"
                exit 0
                ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

# System Info Function
system_info() {
    clear
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}       System Information       ${NC}"
    echo -e "${GREEN}================================${NC}"
    echo
    
    echo "=== System ==="
    uname -a
    echo
    
    echo "=== Uptime ==="
    uptime
    echo
    
    echo "=== Disk Usage ==="
    df -h
    echo
    
    echo "=== Memory Usage ==="
    free -h
    echo
    
    echo "=== CPU Usage ==="
    top -bn1 | grep "Cpu(s)" | awk '{print $2 $3 $4 $5 $6 $7 $8}'
    echo
    
    echo "=== Network ==="
    ip addr show | grep -E "(inet|inet6)" | grep -v "127.0.0.1" | head -5
    echo
    
    echo "=== Services Status ==="
    echo "Nginx: $(sudo systemctl is-active nginx 2>/dev/null || echo 'not installed')"
    echo "Redis: $(sudo systemctl is-active redis-server 2>/dev/null || echo 'not installed')"
    echo "PM2: $(pm2 status | grep -c "online" 2>/dev/null || echo '0') processes running"
    
    if command_exists node; then
        echo "=== Node.js ==="
        echo "Node.js: $(node --version)"
        echo "npm: $(npm --version)"
        echo
    fi
    
    read -p "Press Enter to continue..."
}

# Add a quick setup check function
check_prerequisites() {
    local missing_tools=()
    
    if ! command_exists git; then
        missing_tools+=("git")
    fi
    
    if ! command_exists node; then
        missing_tools+=("nodejs")
    fi
    
    if ! command_exists npm; then
        missing_tools+=("npm")
    fi
    
    if ! command_exists curl; then
        missing_tools+=("curl")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing_tools[*]}"
        read -p "Install missing tools now? (y/N): " install_confirm
        if [[ "$install_confirm" =~ ^[Yy]$ ]]; then
            log "Installing missing tools..."
            sudo apt-get update -qq
            sudo apt-get install -y "${missing_tools[@]}"
        else
            warning "Some features may not work without these tools."
        fi
    else
        log "All prerequisites are available."
    fi
}

# Main execution
main() {
    log "Starting VX10 Admin Panel..."
    setup_user_context
    check_prerequisites
    main_menu
}

# Run main function
main "$@"
