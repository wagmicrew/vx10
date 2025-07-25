#!/bin/bash

# Din Trafikskola HLM Migration Script
# Migrates existing VX10 installation to new branding and structure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Migration configuration
OLD_PROJECT_NAME="vx10"
NEW_PROJECT_NAME="din-trafikskola-hlm"
OLD_USER="vx10"
NEW_USER="trafikskola"
OLD_DB_NAME="vx10db"
NEW_DB_NAME="trafikskoladb"
OLD_DB_USER="vx10user"
NEW_DB_USER="trafikskolauser"

# Directories
OLD_PROJECT_DIR="/var/www/vx10"
NEW_PROJECT_DIR="/var/www/din-trafikskola-hlm"
OLD_LOG_DIR="/var/log/vx10"
NEW_LOG_DIR="/var/log/din-trafikskola-hlm"

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

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This migration script must be run as root"
        echo "Please run: sudo $0"
        exit 1
    fi
}

# Function to backup current installation
backup_current_installation() {
    local backup_dir="/tmp/vx10-migration-backup-$(date +%Y%m%d_%H%M%S)"
    
    log "Creating backup of current installation..."
    mkdir -p "$backup_dir"
    
    # Backup project directory
    if [[ -d "$OLD_PROJECT_DIR" ]]; then
        log "Backing up project directory..."
        cp -r "$OLD_PROJECT_DIR" "$backup_dir/project"
    fi
    
    # Backup nginx configuration
    if [[ -f "/etc/nginx/sites-available/vx10" ]]; then
        log "Backing up nginx configuration..."
        cp "/etc/nginx/sites-available/vx10" "$backup_dir/nginx-vx10"
    fi
    
    # Backup PM2 ecosystem file if exists
    if [[ -f "$OLD_PROJECT_DIR/ecosystem.config.js" ]]; then
        cp "$OLD_PROJECT_DIR/ecosystem.config.js" "$backup_dir/ecosystem.config.js"
    fi
    
    # Backup logs
    if [[ -d "$OLD_LOG_DIR" ]]; then
        log "Backing up logs..."
        cp -r "$OLD_LOG_DIR" "$backup_dir/logs"
    fi
    
    success "Backup created at: $backup_dir"
    echo "$backup_dir" > /tmp/vx10-migration-backup-path
}

# Function to create new user
create_new_user() {
    log "Setting up new user: $NEW_USER"
    
    if id "$NEW_USER" &>/dev/null; then
        warning "User $NEW_USER already exists, skipping creation"
    else
        useradd -m -s /bin/bash "$NEW_USER"
        usermod -aG sudo "$NEW_USER"
        usermod -aG www-data "$NEW_USER"
        success "Created user: $NEW_USER"
    fi
    
    # Copy SSH keys and configuration from old user if exists
    if id "$OLD_USER" &>/dev/null && [[ -d "/home/$OLD_USER/.ssh" ]]; then
        log "Copying SSH keys from $OLD_USER to $NEW_USER..."
        cp -r "/home/$OLD_USER/.ssh" "/home/$NEW_USER/"
        chown -R "$NEW_USER:$NEW_USER" "/home/$NEW_USER/.ssh"
        chmod 700 "/home/$NEW_USER/.ssh"
        chmod 600 "/home/$NEW_USER/.ssh/"*
    fi
}

# Function to migrate project directory
migrate_project_directory() {
    log "Migrating project directory..."
    
    if [[ ! -d "$OLD_PROJECT_DIR" ]]; then
        error "Old project directory not found: $OLD_PROJECT_DIR"
        return 1
    fi
    
    # Create new project directory
    mkdir -p "$NEW_PROJECT_DIR"
    
    # Copy all files from old to new directory using git
    cd "$OLD_PROJECT_DIR"
    
    # Check if it's a git repository
    if [[ -d ".git" ]]; then
        log "Syncing git repository to new location..."
        
        # Clone the repository to new location
        git clone . "$NEW_PROJECT_DIR"
        cd "$NEW_PROJECT_DIR"
        
        # Set proper ownership
        chown -R "$NEW_USER:www-data" "$NEW_PROJECT_DIR"
        
        # Fix git ownership
        git config --global --add safe.directory "$NEW_PROJECT_DIR"
        
    else
        log "Not a git repository, copying files directly..."
        cp -r "$OLD_PROJECT_DIR"/* "$NEW_PROJECT_DIR/"
        chown -R "$NEW_USER:www-data" "$NEW_PROJECT_DIR"
    fi
    
    success "Project directory migrated to: $NEW_PROJECT_DIR"
}

# Function to update configuration files
update_configuration_files() {
    log "Updating configuration files..."
    
    cd "$NEW_PROJECT_DIR"
    
    # Update package.json if it contains project name references
    if [[ -f "package.json" ]]; then
        log "Updating package.json..."
        sed -i "s/vx10/din-trafikskola-hlm/g" package.json
        sed -i "s/VX10/Din Trafikskola HLM/g" package.json
    fi
    
    # Update ecosystem.config.js
    if [[ -f "ecosystem.config.js" ]]; then
        log "Updating PM2 ecosystem configuration..."
        sed -i "s/vx10/din-trafikskola-hlm/g" ecosystem.config.js
        sed -i "s/VX10/Din Trafikskola HLM/g" ecosystem.config.js
        sed -i "s|/var/www/vx10|/var/www/din-trafikskola-hlm|g" ecosystem.config.js
        sed -i "s|/var/log/vx10|/var/log/din-trafikskola-hlm|g" ecosystem.config.js
    fi
    
    # Update .env files
    for env_file in .env .env.local .env.production; do
        if [[ -f "$env_file" ]]; then
            log "Updating $env_file..."
            sed -i "s/vx10/din-trafikskola-hlm/g" "$env_file"
            sed -i "s/VX10/Din Trafikskola HLM/g" "$env_file"
            sed -i "s/$OLD_DB_NAME/$NEW_DB_NAME/g" "$env_file"
            sed -i "s/$OLD_DB_USER/$NEW_DB_USER/g" "$env_file"
        fi
    done
    
    # Update next.config.js
    if [[ -f "next.config.js" ]]; then
        log "Updating next.config.js..."
        sed -i "s/vx10/din-trafikskola-hlm/g" next.config.js
        sed -i "s/VX10/Din Trafikskola HLM/g" next.config.js
    fi
    
    # Update prisma schema if exists
    if [[ -f "prisma/schema.prisma" ]]; then
        log "Updating Prisma schema..."
        sed -i "s/$OLD_DB_NAME/$NEW_DB_NAME/g" prisma/schema.prisma
        sed -i "s/$OLD_DB_USER/$NEW_DB_USER/g" prisma/schema.prisma
    fi
    
    # Update any README or documentation files
    for doc_file in README.md README.txt INSTALL.md; do
        if [[ -f "$doc_file" ]]; then
            log "Updating $doc_file..."
            sed -i "s/vx10/din-trafikskola-hlm/g" "$doc_file"
            sed -i "s/VX10/Din Trafikskola HLM/g" "$doc_file"
        fi
    done
    
    success "Configuration files updated"
}

# Function to migrate nginx configuration
migrate_nginx_configuration() {
    log "Migrating Nginx configuration..."
    
    local old_nginx_config="/etc/nginx/sites-available/vx10"
    local new_nginx_config="/etc/nginx/sites-available/din-trafikskola-hlm"
    
    if [[ -f "$old_nginx_config" ]]; then
        # Copy and update nginx configuration
        cp "$old_nginx_config" "$new_nginx_config"
        
        # Update paths and references in nginx config
        sed -i "s|/var/www/vx10|/var/www/din-trafikskola-hlm|g" "$new_nginx_config"
        sed -i "s|/var/log/vx10|/var/log/din-trafikskola-hlm|g" "$new_nginx_config"
        sed -i "s/vx10/din-trafikskola-hlm/g" "$new_nginx_config"
        
        # Disable old site and enable new site
        if [[ -L "/etc/nginx/sites-enabled/vx10" ]]; then
            rm "/etc/nginx/sites-enabled/vx10"
        fi
        
        ln -sf "$new_nginx_config" "/etc/nginx/sites-enabled/din-trafikskola-hlm"
        
        # Test nginx configuration
        if nginx -t; then
            success "Nginx configuration updated and tested successfully"
        else
            error "Nginx configuration test failed"
            return 1
        fi
    else
        warning "No existing Nginx configuration found at $old_nginx_config"
        info "You may need to create a new Nginx configuration manually"
    fi
}

# Function to migrate logs directory
migrate_logs() {
    log "Migrating logs directory..."
    
    if [[ -d "$OLD_LOG_DIR" ]]; then
        # Create new log directory
        mkdir -p "$NEW_LOG_DIR"
        
        # Copy logs
        cp -r "$OLD_LOG_DIR"/* "$NEW_LOG_DIR/" 2>/dev/null || true
        
        # Set proper permissions
        chown -R "$NEW_USER:www-data" "$NEW_LOG_DIR"
        chmod -R 755 "$NEW_LOG_DIR"
        
        success "Logs migrated to: $NEW_LOG_DIR"
    else
        log "Creating new logs directory..."
        mkdir -p "$NEW_LOG_DIR"
        chown "$NEW_USER:www-data" "$NEW_LOG_DIR"
        chmod 755 "$NEW_LOG_DIR"
    fi
}

# Function to migrate database
migrate_database() {
    log "Migrating database..."
    
    # Check if PostgreSQL is running
    if ! systemctl is-active --quiet postgresql; then
        log "Starting PostgreSQL..."
        systemctl start postgresql
    fi
    
    # Check if old database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$OLD_DB_NAME"; then
        log "Found existing database: $OLD_DB_NAME"
        
        # Create new user if doesn't exist
        if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$NEW_DB_USER'" | grep -q 1; then
            log "Creating new database user: $NEW_DB_USER"
            sudo -u postgres psql -c "CREATE USER $NEW_DB_USER WITH ENCRYPTED PASSWORD 'trafikskolapass';"
        fi
        
        # Create new database
        if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$NEW_DB_NAME"; then
            log "Creating new database: $NEW_DB_NAME"
            sudo -u postgres psql -c "CREATE DATABASE $NEW_DB_NAME OWNER $NEW_DB_USER;"
        fi
        
        # Dump and restore data
        log "Migrating database data..."
        local dump_file="/tmp/vx10-db-migration-$(date +%Y%m%d_%H%M%S).sql"
        
        sudo -u postgres pg_dump "$OLD_DB_NAME" > "$dump_file"
        sudo -u postgres psql -d "$NEW_DB_NAME" < "$dump_file"
        
        # Grant privileges
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $NEW_DB_NAME TO $NEW_DB_USER;"
        
        # Clean up dump file
        rm "$dump_file"
        
        success "Database migrated successfully"
    else
        warning "Old database $OLD_DB_NAME not found, skipping database migration"
    fi
}

# Function to stop old services
stop_old_services() {
    log "Stopping old services..."
    
    # Stop PM2 processes for old user
    if id "$OLD_USER" &>/dev/null; then
        log "Stopping PM2 processes for user: $OLD_USER"
        sudo -u "$OLD_USER" pm2 delete all 2>/dev/null || true
        sudo -u "$OLD_USER" pm2 kill 2>/dev/null || true
    fi
}

# Function to start new services
start_new_services() {
    log "Starting new services..."
    
    cd "$NEW_PROJECT_DIR"
    
    # Install/update dependencies
    log "Installing dependencies..."
    sudo -u "$NEW_USER" npm install
    
    # Build project
    log "Building project..."
    sudo -u "$NEW_USER" npm run build
    
    # Start PM2 processes
    if [[ -f "ecosystem.config.js" ]]; then
        log "Starting PM2 processes..."
        sudo -u "$NEW_USER" pm2 start ecosystem.config.js
        sudo -u "$NEW_USER" pm2 save
    fi
    
    # Restart Nginx
    log "Restarting Nginx..."
    systemctl restart nginx
    
    success "New services started successfully"
}

# Function to create migration summary
create_migration_summary() {
    local summary_file="/tmp/vx10-migration-summary-$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$summary_file" << EOF
Din Trafikskola HLM Migration Summary
=====================================
Migration Date: $(date)
Backup Location: $(cat /tmp/vx10-migration-backup-path 2>/dev/null || echo "Not available")

Changes Made:
- Project directory: $OLD_PROJECT_DIR → $NEW_PROJECT_DIR
- User account: $OLD_USER → $NEW_USER
- Database: $OLD_DB_NAME → $NEW_DB_NAME
- Database user: $OLD_DB_USER → $NEW_DB_USER
- Log directory: $OLD_LOG_DIR → $NEW_LOG_DIR
- Nginx config: /etc/nginx/sites-available/vx10 → /etc/nginx/sites-available/din-trafikskola-hlm

Configuration files updated:
- package.json
- ecosystem.config.js
- .env files
- next.config.js
- prisma/schema.prisma (if exists)
- README files

Services:
- PM2 processes restarted under new user
- Nginx configuration updated and restarted

Next Steps:
1. Verify the application is running correctly
2. Update any external references (DNS, monitoring, etc.)
3. Update deployment scripts or CI/CD pipelines
4. Consider removing old files after verification (not done automatically)

For rollback: Use backup at $(cat /tmp/vx10-migration-backup-path 2>/dev/null || echo "backup location")
EOF

    success "Migration summary created: $summary_file"
    cat "$summary_file"
}

# Main migration function
main_migration() {
    log "Starting VX10 to Din Trafikskola HLM migration..."
    
    echo "========================================="
    echo "  VX10 → Din Trafikskola HLM Migration  "
    echo "========================================="
    echo
    warning "This will migrate your VX10 installation to Din Trafikskola HLM"
    warning "This includes changing directories, user accounts, and database names"
    echo
    read -p "Do you want to continue? (y/N): " confirm
    
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        info "Migration cancelled by user"
        exit 0
    fi
    
    # Perform migration steps
    backup_current_installation
    create_new_user
    migrate_project_directory
    update_configuration_files
    migrate_nginx_configuration
    migrate_logs
    migrate_database
    stop_old_services
    start_new_services
    create_migration_summary
    
    echo
    success "Migration completed successfully!"
    echo
    info "Please verify that the application is working correctly."
    info "If everything looks good, you can remove the old directories and user manually."
    warning "Old backup is available for rollback if needed."
}

# Check if script is being called directly or sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_root
    main_migration "$@"
fi
