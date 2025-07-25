#!/bin/bash

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

# Function to fix git ownership issues
fix_git_ownership() {
    local project_dir="${1:-$(pwd)}"
    
    if [[ -d "$project_dir/.git" ]]; then
        log "Fixing git ownership for $project_dir..."
        
        # Add safe directory
        git config --global --add safe.directory "$project_dir" 2>/dev/null || true
        
        # Fix ownership of git directory
        sudo chown -R "$DEPLOY_USER:$DEPLOY_USER" "$project_dir/.git" 2>/dev/null || true
        
        # Fix ownership of the entire project for git operations
        sudo chown -R "$DEPLOY_USER:www-data" "$project_dir" 2>/dev/null || true
        
        success "Git ownership fixed"
    fi
}

# Enhanced user context setup with optimized permissions
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
    
    # Optimized fix permissions function - only fix essential directories
    fix_permissions() {
        local current_dir="$(pwd)"
        if [[ -d "$current_dir" ]]; then
            log "Fixing permissions for essential directories only..."
            
            # Only fix ownership for the main directory
            sudo chown "$DEPLOY_USER:www-data" "$current_dir" 2>/dev/null || true
            
            # Fix permissions for specific important directories only
            for dir in ".next" "node_modules" "logs" "public" "src"; do
                if [[ -d "$current_dir/$dir" ]]; then
                    log "Fixing permissions for $dir..."
                    sudo chown -R "$DEPLOY_USER:www-data" "$current_dir/$dir" 2>/dev/null || true &
                fi
            done
            
            # Fix permissions for important files only
            for file in "package.json" "package-lock.json" ".env" ".env.local" "next.config.js" "ecosystem.config.js"; do
                if [[ -f "$current_dir/$file" ]]; then
                    sudo chown "$DEPLOY_USER:www-data" "$current_dir/$file" 2>/dev/null || true
                    sudo chmod 644 "$current_dir/$file" 2>/dev/null || true
                fi
            done
            
            # Ensure vx10 user is in www-data group
            if id "vx10" &>/dev/null; then
                sudo usermod -aG www-data vx10 2>/dev/null || true
            fi
            
            # Wait for background processes to complete
            wait
            
            log "Essential permissions fixed for $current_dir"
        fi
    }
    
    fix_permissions
}

# Enhanced execute_with_user function
execute_with_user() {
    local command="$1"
    
    if [[ $IS_ROOT == true ]]; then
        # Set proper environment for the user
        runuser -l "$DEPLOY_USER" -c "export HOME='$DEPLOY_HOME' && export PATH=\$PATH:/usr/local/bin && $command"
    else
        eval "$command"
    fi
}

# Function to prompt for project directory
prompt_project_dir() {
    if [[ -n "$1" ]]; then
        echo "$1"
        return
    fi
    
    local current_dir="$(pwd)"
    if [[ -f "$current_dir/package.json" ]]; then
        echo "$current_dir"
    else
        echo "$DEFAULT_PROJECT_DIR"
    fi
}

# Function to clear cache
clear_cache() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    log "Clearing Next.js cache..."
    rm -rf .next/cache
    
    log "Clearing npm cache..."
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "npm cache clean --force"
    else
        npm cache clean --force
    fi
    success "Cache cleared"
    read -p "Press Enter to continue..."
}

# Function to install or reinstall dependencies
reinstall_dependencies() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"

    log "Installing/reinstalling dependencies..."
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    # Remove existing files
    rm -rf node_modules package-lock.json
    
    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        error "package.json not found in $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    # Use npm install instead of npm ci when no lock file exists
    log "Running npm install to generate package-lock.json..."
    if [[ $IS_ROOT == true ]]; then
        execute_with_user "cd '$project_dir' && npm install"
    else
        npm install
    fi
    
    # Fix permissions after install
    fix_permissions
    
    success "Dependencies installed"
    read -p "Press Enter to continue..."
}

# Function to restart the application
restart_application() {
    log "Restarting application..."
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "pm2 restart all"
    else
        pm2 restart all
    fi
    success "Application restarted"
    read -p "Press Enter to continue..."
}

# Function to pull from a specific branch and build
github_pull_specific_branch() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    read -p "Enter branch name to pull from: " branch_name
    if [[ -z "$branch_name" ]]; then
        error "No branch name entered"
        return 1
    fi
    
    log "Pulling from branch $branch_name..."
    execute_with_user "cd '$project_dir' && git fetch origin"
    execute_with_user "cd '$project_dir' && git checkout '$branch_name' || git checkout -b '$branch_name'"
    execute_with_user "cd '$project_dir' && git pull origin '$branch_name'"
    
    log "Installing dependencies..."
    if [[ -f "package-lock.json" ]]; then
        execute_with_user "cd '$project_dir' && npm ci"
    else
        execute_with_user "cd '$project_dir' && npm install"
    fi
    
    log "Building project..."
    execute_with_user "cd '$project_dir' && npm run build"
    
    success "Pulled and built from branch $branch_name"
    read -p "Press Enter to continue..."
}

# Enhanced github_pull_build function
github_pull_build() {
    local project_dir=$(prompt_project_dir)
    log "Pulling latest changes and building..."
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    cd "$project_dir"
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    # Pull changes
    execute_with_user "cd '$project_dir' && git fetch origin && git pull origin \$(git branch --show-current)"
    
    log "Installing dependencies..."
    # Check if package-lock.json exists, use appropriate command
    if [[ -f "package-lock.json" ]]; then
        execute_with_user "cd '$project_dir' && npm ci"
    else
        log "No package-lock.json found, using npm install..."
        execute_with_user "cd '$project_dir' && npm install"
    fi
    
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
    
    log "Running comprehensive diagnostics and fixes..."
    
    # Fix git ownership
    fix_git_ownership "$project_dir"
    
    # Check package.json
    if [[ ! -f "package.json" ]]; then
        error "package.json not found!"
        return 1
    fi
    
    log "✓ package.json found"
    
    # Check if node_modules exists and is not empty
    if [[ ! -d "node_modules" ]] || [[ -z "$(ls -A node_modules 2>/dev/null)" ]]; then
        log "⚠ node_modules missing or empty, installing..."
        execute_with_user "cd '$project_dir' && npm install"
    else
        log "✓ node_modules directory exists"
    fi
    
    # Check if Next.js is available
    if [[ ! -f "node_modules/.bin/next" ]]; then
        warning "Next.js not found, reinstalling dependencies..."
        execute_with_user "cd '$project_dir' && npm install"
    else
        log "✓ Next.js is available"
    fi
    
    # Check if .next exists
    if [[ ! -d ".next" ]]; then
        log "⚠ .next directory missing, building..."
        execute_with_user "cd '$project_dir' && npx next build"
    else
        log "✓ .next build directory exists"
    fi
    
    # Check PM2 processes
    if [[ $IS_ROOT == true ]]; then
        local pm2_status=$(runuser -l "$DEPLOY_USER" -c "pm2 status" 2>/dev/null | grep -c "online" || echo "0")
    else
        local pm2_status=$(pm2 status 2>/dev/null | grep -c "online" || echo "0")
    fi
    
    if [[ "$pm2_status" -eq 0 ]]; then
        log "⚠ No PM2 processes running"
        if [[ -f "ecosystem.config.js" ]]; then
            log "Starting application with PM2..."
            if [[ $IS_ROOT == true ]]; then
                runuser -l "$DEPLOY_USER" -c "cd '$project_dir' && pm2 start ecosystem.config.js"
            else
                cd "$project_dir" && pm2 start ecosystem.config.js
            fi
        else
            warning "ecosystem.config.js not found. Cannot start PM2 processes."
        fi
    else
        log "✓ PM2 processes are running ($pm2_status online)"
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

# Enhanced node_install_deps function with permission fixes
node_install_deps() {
    local project_dir=$(prompt_project_dir)
    
    log "Installing dependencies..."
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    # Check if package.json exists
    if [[ ! -f "$project_dir/package.json" ]]; then
        error "package.json not found in $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    # Remove existing node_modules if permissions are broken
    if [[ -d "$project_dir/node_modules" ]]; then
        log "Checking node_modules permissions..."
        if [[ ! -x "$project_dir/node_modules/.bin/prisma" ]] && [[ -f "$project_dir/node_modules/.bin/prisma" ]]; then
            warning "Found permission issues with node_modules, cleaning..."
            execute_with_user "cd '$project_dir' && rm -rf node_modules package-lock.json"
        fi
    fi
    
    # Check if package-lock.json exists
    if [[ -f "$project_dir/package-lock.json" ]]; then
        log "Using npm ci (clean install)..."
        execute_with_user "cd '$project_dir' && npm ci"
    else
        log "No package-lock.json found, using npm install..."
        execute_with_user "cd '$project_dir' && npm install"
    fi
    
    # Fix permissions after install
    fix_node_modules_permissions "$project_dir"
    
    # Verify installation
    if [[ -d "$project_dir/node_modules" ]]; then
        success "Dependencies installed successfully"
        
        # Check if Next.js is installed
        if [[ -f "$project_dir/node_modules/.bin/next" ]]; then
            log "Next.js is available: $(execute_with_user "cd '$project_dir' && npx next --version")"
        else
            warning "Next.js not found in dependencies"
        fi
    else
        error "Dependencies installation failed"
    fi
    
    read -p "Press Enter to continue..."
}

# Add function to fix node_modules permissions
fix_node_modules_permissions() {
    local project_dir="$1"
    
    if [[ -d "$project_dir/node_modules" ]]; then
        log "Fixing node_modules permissions..."
        
        # Fix ownership
        if [[ $IS_ROOT == true ]]; then
            chown -R "$DEPLOY_USER:www-data" "$project_dir/node_modules"
        fi
        
        # Fix executable permissions for .bin directory
        if [[ -d "$project_dir/node_modules/.bin" ]]; then
            chmod -R 755 "$project_dir/node_modules/.bin"
            log "Fixed .bin directory permissions"
        fi
        
        # Fix specific binaries that commonly have permission issues
        local binaries=("prisma" "next" "eslint" "typescript")
        for binary in "${binaries[@]}"; do
            if [[ -f "$project_dir/node_modules/.bin/$binary" ]]; then
                chmod +x "$project_dir/node_modules/.bin/$binary"
                log "Fixed $binary permissions"
            fi
        done
    fi
}

# Enhanced node_clean_reinstall function
node_clean_reinstall() {
    local project_dir=$(prompt_project_dir)
    
    warning "This will delete node_modules and package-lock.json!"
    read -p "Are you sure? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        # Fix git ownership first
        fix_git_ownership "$project_dir"
        
        log "Cleaning node_modules..."
        execute_with_user "cd '$project_dir' && rm -rf node_modules package-lock.json .next"
        
        log "Clearing npm cache..."
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "npm cache clean --force"
        else
            npm cache clean --force
        fi
        
        log "Reinstalling dependencies..."
        execute_with_user "cd '$project_dir' && npm install"
        
        # Fix permissions after install
        fix_node_modules_permissions "$project_dir"
        fix_permissions
        
        success "Clean reinstall completed"
    fi
    read -p "Press Enter to continue..."
}

# Add a function to specifically fix permission issues
node_fix_permissions() {
    local project_dir=$(prompt_project_dir)
    
    log "Fixing Node.js related permissions..."
    
    # Fix git ownership
    fix_git_ownership "$project_dir"
    
    # Fix node_modules permissions
    fix_node_modules_permissions "$project_dir"
    
    # Fix general permissions
    fix_permissions
    
    success "Permissions fixed"
    read -p "Press Enter to continue..."
}

# GitHub menu functions
github_pull() {
    local project_dir=$(pwd)
    log "Pulling latest changes from current directory: $project_dir"
    
    if [[ ! -d ".git" ]]; then
        error "Current directory is not a git repository"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    execute_with_user "cd '$project_dir' && git fetch origin && git pull origin \$(git branch --show-current)"
    success "Successfully pulled latest changes"
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
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    execute_with_user "cd '$project_dir' && git stash push -m 'Auto-stash before pull \$(date)' && git fetch origin && git pull origin \$(git branch --show-current)"
    
    success "Successfully stashed and pulled"
    warning "Your local changes are stashed. Use 'git stash pop' to restore them."
    read -p "Press Enter to continue..."
}

github_push_pull() {
    local project_dir=$(prompt_project_dir)
    log "Committing local changes and pulling..."
    
    if [[ ! -d "$project_dir" ]]; then
        error "Directory does not exist: $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
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
    
    success "Successfully synchronized with remote"
    read -p "Press Enter to continue..."
}

github_force_pull() {
    local project_dir=$(prompt_project_dir)
    warning "This will discard ALL local changes!"
    read -p "Are you sure? (y/N): " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        # Fix git ownership first
        fix_git_ownership "$project_dir"
        
        log "Force pulling (discarding local changes)..."
        execute_with_user "cd '$project_dir' && git fetch origin && git reset --hard origin/\$(git branch --show-current)"
        success "Force pull completed"
    fi
    read -p "Press Enter to continue..."
}

github_status() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    log "Git status for $project_dir:"
    execute_with_user "cd '$project_dir' && git status"
    read -p "Press Enter to continue..."
}

github_log() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    log "Recent git commits:"
    execute_with_user "cd '$project_dir' && git log --oneline -10"
    read -p "Press Enter to continue..."
}

github_switch_branch() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    log "Available branches:"
    execute_with_user "cd '$project_dir' && git branch -a"
    echo
    read -p "Enter branch name to switch to: " branch_name
    if [[ -n "$branch_name" ]]; then
        execute_with_user "cd '$project_dir' && git checkout '$branch_name'"
        success "Switched to branch $branch_name"
    fi
    read -p "Press Enter to continue..."
}

github_create_branch() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    read -p "Enter new branch name: " branch_name
    if [[ -n "$branch_name" ]]; then
        execute_with_user "cd '$project_dir' && git checkout -b '$branch_name'"
        success "Created and switched to branch $branch_name"
    fi
    read -p "Press Enter to continue..."
}

github_remotes() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    # Fix git ownership first
    fix_git_ownership "$project_dir"
    
    log "Remote repositories:"
    execute_with_user "cd '$project_dir' && git remote -v"
    read -p "Press Enter to continue..."
}

# Menu functions
github_menu() {
    while true; do
        clear
        echo -e "${CYAN}================================${NC}"
        echo -e "${CYAN}     VX10 GitHub Management     ${NC}"
        echo -e "${CYAN}================================${NC}"
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

node_check_deps() {
    local project_dir=$(prompt_project_dir)
    
    log "Checking dependencies..."
    execute_with_user "cd '$project_dir' && npm list --depth=0"
    read -p "Press Enter to continue..."
}

node_update_deps() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    log "Updating dependencies..."
    if [[ $IS_ROOT == true ]]; then
        execute_with_user "cd '$project_dir' && npm update"
    else
        npm update
    fi
    success "Dependencies updated"
    read -p "Press Enter to continue..."
}

node_audit_deps() {
    local project_dir=$(prompt_project_dir)
    cd "$project_dir"
    
    log "Auditing dependencies..."
    if [[ $IS_ROOT == true ]]; then
        execute_with_user "cd '$project_dir' && npm audit"
    else
        npm audit
    fi
    echo
    read -p "Fix vulnerabilities automatically? (y/N): " fix_vulns
    if [[ "$fix_vulns" =~ ^[Yy]$ ]]; then
        if [[ $IS_ROOT == true ]]; then
            execute_with_user "cd '$project_dir' && npm audit fix"
        else
            npm audit fix
        fi
    fi
    read -p "Press Enter to continue..."
}

node_clean_cache() {
    log "Cleaning npm cache..."
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "npm cache clean --force"
    else
        npm cache clean --force
    fi
    success "Cache cleaned"
    read -p "Press Enter to continue..."
}

node_build() {
    local project_dir=$(prompt_project_dir)
    
    log "Building project..."
    
    # Check if package.json exists
    if [[ ! -f "$project_dir/package.json" ]]; then
        error "package.json not found in $project_dir"
        read -p "Press Enter to continue..."
        return 1
    fi
    
    # Check if node_modules exists
    if [[ ! -d "$project_dir/node_modules" ]]; then
        warning "node_modules not found. Installing dependencies first..."
        execute_with_user "cd '$project_dir' && npm install"
        fix_node_modules_permissions "$project_dir"
    fi
    
    # Check if next is available and executable
    if [[ ! -f "$project_dir/node_modules/.bin/next" ]] || [[ ! -x "$project_dir/node_modules/.bin/next" ]]; then
        warning "Next.js not found or not executable. Installing dependencies..."
        execute_with_user "cd '$project_dir' && rm -rf node_modules package-lock.json && npm install"
        fix_node_modules_permissions "$project_dir"
    fi
    
    # Check if prisma is available and executable (needed for build)
    if [[ -f "$project_dir/node_modules/.bin/prisma" ]] && [[ ! -x "$project_dir/node_modules/.bin/prisma" ]]; then
        warning "Prisma binary found but not executable. Fixing permissions..."
        fix_node_modules_permissions "$project_dir"
    fi
    
    # Generate Prisma client if schema exists
    if [[ -f "$project_dir/prisma/schema.prisma" ]]; then
        log "Generating Prisma client..."
        execute_with_user "cd '$project_dir' && npx prisma generate"
        if [[ $? -ne 0 ]]; then
            error "Prisma generate failed. Trying to fix permissions and retry..."
            fix_node_modules_permissions "$project_dir"
            execute_with_user "cd '$project_dir' && npx prisma generate"
        fi
    fi
    
    # Use npx to ensure we use the local version
    log "Building with Next.js..."
    execute_with_user "cd '$project_dir' && npx next build"
    
    if [[ $? -eq 0 ]]; then
        success "Build completed successfully"
    else
        error "Build failed"
        log "Trying to diagnose the issue..."
        
        # Check if it's a permission issue
        if [[ ! -x "$project_dir/node_modules/.bin/next" ]]; then
            warning "Next.js binary is not executable. Fixing permissions..."
            fix_node_modules_permissions "$project_dir"
            log "Retrying build..."
            execute_with_user "cd '$project_dir' && npx next build"
        fi
    fi
    
    read -p "Press Enter to continue..."
}

node_test() {
    local project_dir=$(prompt_project_dir)
    
    log "Running tests..."
    
    # Check if test script exists in package.json
    if grep -q '"test"' "$project_dir/package.json"; then
        execute_with_user "cd '$project_dir' && npm test"
    else
        warning "No test script found in package.json"
        log "Available scripts:"
        execute_with_user "cd '$project_dir' && npm run"
    fi
    
    read -p "Press Enter to continue..."
}

node_version() {
    log "System versions:"
    if [[ $IS_ROOT == true ]]; then
        echo "Node.js: $(runuser -l "$DEPLOY_USER" -c "node --version")"
        echo "npm: $(runuser -l "$DEPLOY_USER" -c "npm --version")"
        echo "npx: $(runuser -l "$DEPLOY_USER" -c "npx --version")"
    else
        echo "Node.js: $(node --version)"
        echo "npm: $(npm --version)"
        echo "npx: $(npx --version)"
    fi
    
    local project_dir=$(prompt_project_dir)
    if [[ -f "$project_dir/package.json" ]]; then
        echo
        log "Project dependencies versions:"
        if [[ -f "$project_dir/node_modules/.bin/next" ]]; then
            echo "Next.js: $(execute_with_user "cd '$project_dir' && npx next --version")"
        fi
        
        # Show key package versions from package.json
        echo "Package.json dependencies:"
        grep -A 20 '"dependencies"' "$project_dir/package.json" | grep -E '(next|react|prisma)' | head -10
    fi
    
    read -p "Press Enter to continue..."
}

node_menu() {
    while true; do
        clear
        echo -e "${GREEN}================================${NC}"
        echo -e "${GREEN}     VX10 Node.js Management    ${NC}"
        echo -e "${GREEN}================================${NC}"
        echo
        echo "1) Check project health"
        echo "2) Install dependencies"
        echo "3) Update dependencies"
        echo "4) Audit dependencies"
        echo "5) Clean cache"
        echo "6) Clean reinstall"
        echo "7) Build project"
        echo "8) Start dev server"
        echo "9) Run tests"
        echo "10) Fix permissions"
        echo "11) Check versions"
        echo "12) Back to main menu"
        echo
        read -p "Select option [1-12]: " choice
        
        case $choice in
            1) node_check_project_health ;;
            2) node_install_deps ;;
            3) node_update_deps ;;
            4) node_audit_deps ;;
            5) node_clean_cache ;;
            6) node_clean_reinstall ;;
            7) node_build ;;
            8) node_dev ;;
            9) node_test ;;
            10) node_fix_permissions ;;
            11) node_version ;;
            12) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

# PM2 Management functions
pm2_status() {
    log "PM2 process status:"
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "pm2 status"
    else
        pm2 status
    fi
    read -p "Press Enter to continue..."
}

pm2_start() {
    local project_dir=$(prompt_project_dir)
    
    log "Starting PM2 processes..."
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "cd '$project_dir' && pm2 start ecosystem.config.js"
    else
        cd "$project_dir" && pm2 start ecosystem.config.js
    fi
    success "PM2 processes started"
    read -p "Press Enter to continue..."
}

pm2_stop() {
    log "Stopping PM2 processes..."
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "pm2 stop all"
    else
        pm2 stop all
    fi
    success "PM2 processes stopped"
    read -p "Press Enter to continue..."
}

pm2_restart() {
    log "Restarting PM2 processes..."
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "pm2 restart all"
    else
        pm2 restart all
    fi
    success "PM2 processes restarted"
    read -p "Press Enter to continue..."
}

pm2_logs() {
    log "Showing PM2 logs (Press Ctrl+C to exit):"
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "pm2 logs"
    else
        pm2 logs
    fi
    read -p "Press Enter to continue..."
}

pm2_delete() {
    warning "This will delete all PM2 processes!"
    read -p "Are you sure? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        log "Deleting PM2 processes..."
        if [[ $IS_ROOT == true ]]; then
            runuser -l "$DEPLOY_USER" -c "pm2 delete all"
        else
            pm2 delete all
        fi
        success "PM2 processes deleted"
    fi
    read -p "Press Enter to continue..."
}

pm2_save() {
    log "Saving PM2 configuration..."
    if [[ $IS_ROOT == true ]]; then
        runuser -l "$DEPLOY_USER" -c "pm2 save"
    else
        pm2 save
    fi
    success "PM2 configuration saved"
    read -p "Press Enter to continue..."
}

pm2_menu() {
    while true; do
        clear
        echo -e "${MAGENTA}================================${NC}"
        echo -e "${MAGENTA}      VX10 PM2 Management       ${NC}"
        echo -e "${MAGENTA}================================${NC}"
        echo
        echo "1) Show status"
        echo "2) Start processes"
        echo "3) Stop processes"
        echo "4) Restart processes"
        echo "5) View logs"
        echo "6) Delete processes"
        echo "7) Save configuration"
        echo "8) Back to main menu"
        echo
        read -p "Select option [1-8]: " choice
        
        case $choice in
            1) pm2_status ;;
            2) pm2_start ;;
            3) pm2_stop ;;
            4) pm2_restart ;;
            5) pm2_logs ;;
            6) pm2_delete ;;
            7) pm2_save ;;
            8) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

# Nginx Management functions
nginx_status() {
    log "Nginx status:"
    sudo systemctl status nginx
    read -p "Press Enter to continue..."
}

nginx_start() {
    log "Starting Nginx..."
    sudo systemctl start nginx
    success "Nginx started"
    read -p "Press Enter to continue..."
}

nginx_stop() {
    log "Stopping Nginx..."
    sudo systemctl stop nginx
    success "Nginx stopped"
    read -p "Press Enter to continue..."
}

nginx_restart() {
    log "Restarting Nginx..."
    sudo systemctl restart nginx
    success "Nginx restarted"
    read -p "Press Enter to continue..."
}

nginx_reload() {
    log "Reloading Nginx configuration..."
    sudo systemctl reload nginx
    success "Nginx configuration reloaded"
    read -p "Press Enter to continue..."
}

nginx_test() {
    log "Testing Nginx configuration..."
    sudo nginx -t
    read -p "Press Enter to continue..."
}

nginx_logs() {
    log "Nginx error logs (last 50 lines):"
    sudo tail -50 /var/log/nginx/error.log
    echo
    log "Nginx access logs (last 20 lines):"
    sudo tail -20 /var/log/nginx/access.log
    read -p "Press Enter to continue..."
}

nginx_menu() {
    while true; do
        clear
        echo -e "${BLUE}================================${NC}"
        echo -e "${BLUE}     VX10 Nginx Management      ${NC}"
        echo -e "${BLUE}================================${NC}"
        echo
        echo "1) Show status"
        echo "2) Start Nginx"
        echo "3) Stop Nginx"
        echo "4) Restart Nginx"
        echo "5) Reload configuration"
        echo "6) Test configuration"
        echo "7) View logs"
        echo "8) Back to main menu"
        echo
        read -p "Select option [1-8]: " choice
        
        case $choice in
            1) nginx_status ;;
            2) nginx_start ;;
            3) nginx_stop ;;
            4) nginx_restart ;;
            5) nginx_reload ;;
            6) nginx_test ;;
            7) nginx_logs ;;
            8) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

# Database Management functions
db_status() {
    log "PostgreSQL status:"
    sudo systemctl status postgresql
    read -p "Press Enter to continue..."
}

db_start() {
    log "Starting PostgreSQL..."
    sudo systemctl start postgresql
    success "PostgreSQL started"
    read -p "Press Enter to continue..."
}

db_stop() {
    log "Stopping PostgreSQL..."
    sudo systemctl stop postgresql
    success "PostgreSQL stopped"
    read -p "Press Enter to continue..."
}

db_restart() {
    log "Restarting PostgreSQL..."
    sudo systemctl restart postgresql
    success "PostgreSQL restarted"
    read -p "Press Enter to continue..."
}

db_connect() {
    log "Connecting to PostgreSQL..."
    read -p "Enter database name (default: vx10db): " db_name
    db_name=${db_name:-vx10db}
    read -p "Enter username (default: vx10user): " db_user
    db_user=${db_user:-vx10user}
    
    psql -h localhost -U "$db_user" -d "$db_name"
    read -p "Press Enter to continue..."
}

db_backup() {
    log "Creating database backup..."
    read -p "Enter database name (default: vx10db): " db_name
    db_name=${db_name:-vx10db}
    read -p "Enter username (default: vx10user): " db_user
    db_user=${db_user:-vx10user}
    
    local backup_file="vx10_backup_$(date +%Y%m%d_%H%M%S).sql"
    pg_dump -h localhost -U "$db_user" -d "$db_name" > "$backup_file"
    success "Backup created: $backup_file"
    read -p "Press Enter to continue..."
}

db_migrate() {
    local project_dir=$(prompt_project_dir)
    
    log "Running database migrations..."
    execute_with_user "cd '$project_dir' && npm run prisma:migrate"
    success "Migrations completed"
    read -p "Press Enter to continue..."
}

database_menu() {
    while true; do
        clear
        echo -e "${YELLOW}================================${NC}"
        echo -e "${YELLOW}    VX10 Database Management    ${NC}"
        echo -e "${YELLOW}================================${NC}"
        echo
        echo "1) Show PostgreSQL status"
        echo "2) Start PostgreSQL"
        echo "3) Stop PostgreSQL"
        echo "4) Restart PostgreSQL"
        echo "5) Connect to database"
        echo "6) Create backup"
        echo "7) Run migrations"
        echo "8) Setup database"
        echo "9) Back to main menu"
        echo
        read -p "Select option [1-9]: " choice
        
        case $choice in
            1) db_status ;;
            2) db_start ;;
            3) db_stop ;;
            4) db_restart ;;
            5) db_connect ;;
            6) db_backup ;;
            7) db_migrate ;;
            8) setup_database ;;
            9) break ;;
            *) error "Invalid option. Please try again." ;;
        esac
    done
}

# Utilities menu
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

# System Information
system_info() {
    clear
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}      System Information        ${NC}"
    echo -e "${CYAN}================================${NC}"
    echo
    
    log "System Information:"
    echo "OS: $(lsb_release -d | cut -f2)"
    echo "Kernel: $(uname -r)"
    echo "Uptime: $(uptime -p)"
    echo
    
    log "Resource Usage:"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)% used"
    echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
    echo "Disk: $(df -h / | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"
    echo
    
    log "Network:"
    ip addr show | grep -E "inet.*global" | awk '{print $2}' | head -5
    echo
    
    log "Services Status:"
    echo "Nginx: $(systemctl is-active nginx 2>/dev/null || echo 'not installed')"
    echo "PostgreSQL: $(systemctl is-active postgresql 2>/dev/null || echo 'not installed')"
    echo "PM2: $(if [[ $IS_ROOT == true ]]; then runuser -l "$DEPLOY_USER" -c "pm2 status" 2>/dev/null | grep -c "online" || echo "0"; else pm2 status 2>/dev/null | grep -c "online" || echo "0"; fi) processes running"
    echo
    
    read -p "Press Enter to continue..."
}

# Main menu
main_menu() {
    while true; do
        clear
        echo -e "${BLUE}================================${NC}"
        echo -e "${BLUE}        VX10 Admin Panel        ${NC}"
        echo -e "${BLUE}================================${NC}"
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

# Main execution
main() {
    log "Starting VX10 Admin Panel..."

    # Setup user context and permissions
    setup_user_context

    # Check prerequisites
    check_prerequisites

    # Start main menu
    main_menu
}

# Run main function
main "$@"

logs_nginx_error() {
    log "Showing Nginx error logs (Press Ctrl+C to exit)..."
    sudo tail -f /var/log/nginx/error.log
}

logs_system() {
    log "Showing system logs (Press Ctrl+C to exit)..."
    sudo journalctl -f
}

logs_application() {
    local project_dir=$(prompt_project_dir)
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
    
    if ! command_exists wget; then
        missing_tools+=("wget")
    fi
    
    if ! command_exists unzip; then
        missing_tools+=("unzip")
    fi
    
    if ! command_exists jq; then
        missing_tools+=("jq")
    fi
    
    if ! command_exists pm2; then
        missing_tools+=("pm2")
    fi
    
    if ! command_exists psql; then
        missing_tools+=("postgresql-client")
    fi
    
    if ! command_exists nginx; then
        missing_tools+=("nginx")
    fi
    
    if ! command_exists redis-server; then
        missing_tools+=("redis-server")
    fi
    
    if ! command_exists certbot; then
        missing_tools+=("certbot")
    fi
    
    if ! command_exists python3; then
        missing_tools+=("python3")
    fi
    
    if ! command_exists python3-venv; then
        missing_tools+=("python3-venv")
    fi
    
    if ! command_exists python3-pip; then
        missing_tools+=("python3-pip")
    fi
    
    if ! command_exists pip3; then
        missing_tools+=("pip3")
    fi
    
    if ! command_exists pipenv; then
        missing_tools+=("pipenv")
    fi
    
    if ! command_exists docker; then
        missing_tools+=("docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_tools+=("docker-compose")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    


    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
    fi
    
    if ! command_exists docker-ce; then
        missing_tools+=("docker-ce")
    fi
    
    if ! command_exists docker-ce-cli; then
        missing_tools+=("docker-ce-cli")
    fi
    
    if ! command_exists docker-compose-plugin; then
        missing_tools+=("docker-compose-plugin")
    fi
    
    if ! command_exists docker.io; then
        missing_tools+=("docker.io")
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
