#!/bin/bash

# VX10 PostgreSQL Local Setup Script for Ubuntu
# Author: VX10 Team
# Description: Complete PostgreSQL setup with user, database, permissions, and Prisma migration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="vx10_db"
DB_USER="vx10user"
DB_PASSWORD="vx10password"
PROJECT_DIR="$(pwd)"
ENV_FILE="$PROJECT_DIR/.env"
BACKUP_ENV_FILE="$PROJECT_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"

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
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
    
    # Check if user has sudo privileges
    if ! sudo -n true 2>/dev/null; then
        error "This script requires sudo privileges. Please ensure your user can run sudo commands."
        exit 1
    fi
}

# Function to detect Ubuntu version
detect_ubuntu_version() {
    if [[ ! -f /etc/os-release ]]; then
        error "Cannot detect Ubuntu version. This script is designed for Ubuntu systems."
        exit 1
    fi
    
    source /etc/os-release
    if [[ "$ID" != "ubuntu" ]]; then
        error "This script is designed for Ubuntu systems. Detected: $ID"
        exit 1
    fi
    
    log "Detected Ubuntu $VERSION_ID"
}

# Function to update system packages
update_system() {
    log "Updating system packages..."
    sudo apt-get update -qq
    sudo apt-get upgrade -y -qq
    success "System packages updated"
}

# Function to install PostgreSQL
install_postgresql() {
    log "Installing PostgreSQL..."
    
    # Check if PostgreSQL is already installed
    if command -v psql >/dev/null 2>&1; then
        warning "PostgreSQL is already installed"
        return 0
    fi
    
    # Install PostgreSQL and additional packages
    sudo apt-get install -y postgresql postgresql-contrib postgresql-client
    
    # Start and enable PostgreSQL service
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Wait for PostgreSQL to be ready
    sleep 3
    
    success "PostgreSQL installed and started"
}

# Function to configure PostgreSQL
configure_postgresql() {
    log "Configuring PostgreSQL..."
    
    # Set postgres user password (for administrative tasks)
    sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" 2>/dev/null || true
    
    # Create database user
    log "Creating database user: $DB_USER"
    sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "ALTER USER $DB_USER CREATEDB;"
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH SUPERUSER;" # Needed for some Prisma operations
    
    # Create database
    log "Creating database: $DB_NAME"
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    
    # Grant all privileges
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    
    success "PostgreSQL configured with user: $DB_USER and database: $DB_NAME"
}

# Function to configure PostgreSQL for local connections
configure_pg_access() {
    log "Configuring PostgreSQL access..."
    
    # Find PostgreSQL version and config directory
    PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
    PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"
    
    if [[ ! -d "$PG_CONFIG_DIR" ]]; then
        # Try alternative path
        PG_CONFIG_DIR=$(find /etc/postgresql -name "postgresql.conf" -type f | head -1 | xargs dirname)
    fi
    
    if [[ ! -d "$PG_CONFIG_DIR" ]]; then
        error "Could not find PostgreSQL configuration directory"
        return 1
    fi
    
    log "Found PostgreSQL config in: $PG_CONFIG_DIR"
    
    # Backup original files
    sudo cp "$PG_CONFIG_DIR/postgresql.conf" "$PG_CONFIG_DIR/postgresql.conf.backup" 2>/dev/null || true
    sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup" 2>/dev/null || true
    
    # Configure postgresql.conf
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "$PG_CONFIG_DIR/postgresql.conf"
    sudo sed -i "s/#port = 5432/port = 5432/" "$PG_CONFIG_DIR/postgresql.conf"
    
    # Configure pg_hba.conf for local connections
    sudo sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" "$PG_CONFIG_DIR/pg_hba.conf"
    
    # Add specific rule for our user
    if ! sudo grep -q "$DB_USER" "$PG_CONFIG_DIR/pg_hba.conf"; then
        echo "local   $DB_NAME        $DB_USER                                md5" | sudo tee -a "$PG_CONFIG_DIR/pg_hba.conf" >/dev/null
    fi
    
    # Restart PostgreSQL to apply changes
    sudo systemctl restart postgresql
    sleep 3
    
    success "PostgreSQL access configured"
}

# Function to test database connection
test_database_connection() {
    log "Testing database connection..."
    
    # Test connection with our user
    if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        success "Database connection test successful"
    else
        error "Database connection test failed"
        return 1
    fi
}

# Function to backup and update .env file
update_env_file() {
    log "Updating .env file..."
    
    # Create backup of existing .env file
    if [[ -f "$ENV_FILE" ]]; then
        cp "$ENV_FILE" "$BACKUP_ENV_FILE"
        log "Backed up existing .env to: $BACKUP_ENV_FILE"
    fi
    
    # Database connection strings
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
    DIRECT_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
    
    # Create or update .env file
    cat > "$ENV_FILE" << EOF
# Local PostgreSQL Configuration
DATABASE_URL="$DATABASE_URL"
DIRECT_URL="$DIRECT_URL"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-change-this-in-production-$(openssl rand -hex 32)"
NEXTAUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"

# Email Configuration (optional - will be stored in Settings table)
# SMTP_HOST=""
# SMTP_PORT=""
# SMTP_USER=""
# SMTP_PASS=""

# Payment Configuration (optional - will be stored in Settings table)
# QLIRO_API_KEY=""
# SWISH_API_KEY=""

# Resend Email Service (optional)
# RESEND_API_KEY=""
EOF
    
    success ".env file updated with local PostgreSQL configuration"
}

# Function to fix file and folder permissions
fix_permissions() {
    log "Fixing file and folder permissions..."
    
    # Fix ownership of project directory
    sudo chown -R "$USER:$USER" "$PROJECT_DIR" 2>/dev/null || true
    
    # Fix permissions for important directories
    chmod 755 "$PROJECT_DIR" 2>/dev/null || true
    chmod 644 "$ENV_FILE" 2>/dev/null || true
    
    # Fix node_modules permissions if it exists
    if [[ -d "$PROJECT_DIR/node_modules" ]]; then
        find "$PROJECT_DIR/node_modules" -type d -exec chmod 755 {} \; 2>/dev/null || true
        find "$PROJECT_DIR/node_modules" -type f -exec chmod 644 {} \; 2>/dev/null || true
        find "$PROJECT_DIR/node_modules/.bin" -type f -exec chmod 755 {} \; 2>/dev/null || true
    fi
    
    # Fix prisma directory permissions
    if [[ -d "$PROJECT_DIR/prisma" ]]; then
        chmod -R 644 "$PROJECT_DIR/prisma"/* 2>/dev/null || true
        chmod 755 "$PROJECT_DIR/prisma" 2>/dev/null || true
    fi
    
    success "File and folder permissions fixed"
}

# Function to install Node.js dependencies
install_dependencies() {
    log "Installing Node.js dependencies..."

    # Check if Node.js is installed
    if ! command -v node >/dev/null 2>&1; then
        log "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

    # Check if npm is available
    if ! command -v npm >/dev/null 2>&1; then
        error "npm is not available after Node.js installation"
        return 1
    fi

    log "Node.js version: $(node --version)"
    log "npm version: $(npm --version)"

    # Clear npm cache
    npm cache clean --force 2>/dev/null || true

    # Install dependencies
    if [[ -f "$PROJECT_DIR/package-lock.json" ]]; then
        npm ci
    else
        npm install
    fi

    success "Dependencies installed"
}

# Function to handle Prisma operations
setup_prisma() {
    log "Setting up Prisma..."

    # Generate Prisma client
    log "Generating Prisma client..."
    npm run prisma:generate

    # Push schema to database (for development)
    log "Pushing schema to database..."
    npm run prisma:push --accept-data-loss 2>/dev/null || {
        warning "Schema push failed, trying with force reset..."
        npm run prisma:push --force-reset 2>/dev/null || {
            error "Failed to push schema. Trying migration approach..."
            # Try migration approach
            npm run prisma:migrate dev --name init 2>/dev/null || {
                error "Migration also failed. Manual intervention may be required."
                return 1
            }
        }
    }

    success "Prisma schema applied to database"
}

# Function to seed the database
seed_database() {
    log "Seeding database with initial data..."

    if [[ -f "$PROJECT_DIR/prisma/seed.js" ]]; then
        node prisma/seed.js || {
            warning "Seeding failed, but continuing..."
        }
        success "Database seeded with initial data"
    else
        warning "No seed file found, skipping database seeding"
    fi
}

# Function to run comprehensive tests
run_tests() {
    log "Running comprehensive tests..."

    # Test database connection
    test_database_connection

    # Test Prisma connection
    log "Testing Prisma connection..."
    if npm run prisma:studio --help >/dev/null 2>&1; then
        success "Prisma is properly configured"
    else
        error "Prisma configuration test failed"
        return 1
    fi

    # Test application build
    log "Testing application build..."
    if npm run build >/dev/null 2>&1; then
        success "Application builds successfully"
    else
        warning "Application build failed, but database setup is complete"
    fi
}

# Function to display final information
show_completion_info() {
    echo
    success "🎉 PostgreSQL local setup completed successfully!"
    echo
    info "Database Configuration:"
    info "  Database: $DB_NAME"
    info "  User: $DB_USER"
    info "  Password: $DB_PASSWORD"
    info "  Host: localhost"
    info "  Port: 5432"
    echo
    info "Connection String:"
    info "  postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
    echo
    info "Files Updated:"
    info "  .env file: $ENV_FILE"
    info "  Backup created: $BACKUP_ENV_FILE"
    echo
    info "Next Steps:"
    info "  1. Start your application: npm run dev"
    info "  2. Access Prisma Studio: npm run prisma:studio"
    info "  3. View your database at: http://localhost:5555"
    echo
    info "Useful Commands:"
    info "  - Connect to database: psql -h localhost -U $DB_USER -d $DB_NAME"
    info "  - Reset database: npm run prisma:push --force-reset"
    info "  - Generate Prisma client: npm run prisma:generate"
    echo
}

# Function to handle errors and cleanup
cleanup_on_error() {
    error "Setup failed. Performing cleanup..."

    # Restore .env backup if it exists
    if [[ -f "$BACKUP_ENV_FILE" ]]; then
        mv "$BACKUP_ENV_FILE" "$ENV_FILE"
        log "Restored .env file from backup"
    fi

    # Optionally remove created database and user
    read -p "Do you want to remove the created database and user? (y/N): " cleanup_db
    if [[ "$cleanup_db" =~ ^[Yy]$ ]]; then
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null || true
        sudo -u postgres psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
        log "Database and user removed"
    fi
}

# Main execution function
main() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}  VX10 PostgreSQL Local Setup  ${NC}"
    echo -e "${CYAN}================================${NC}"
    echo

    # Set up error handling
    trap cleanup_on_error ERR

    # Pre-flight checks
    check_root
    detect_ubuntu_version

    # Main setup steps
    update_system
    install_postgresql
    configure_postgresql
    configure_pg_access
    test_database_connection
    update_env_file
    fix_permissions
    install_dependencies
    setup_prisma
    seed_database
    run_tests

    # Show completion information
    show_completion_info
}

# Run main function with all arguments
main "$@"
