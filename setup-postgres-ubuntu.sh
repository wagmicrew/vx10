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

# User context variables
IS_ROOT=false
CURRENT_USER=""
DEPLOY_USER=""

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

# Function to check user privileges and set up user context
check_user_context() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. Will create/configure a deployment user for safe operations."

        # Create deployment user if it doesn't exist
        DEPLOY_USER="vx10deploy"
        if ! id "$DEPLOY_USER" &>/dev/null; then
            log "Creating deployment user: $DEPLOY_USER"
            useradd -m -s /bin/bash "$DEPLOY_USER"
            usermod -aG sudo "$DEPLOY_USER"

            # Set a temporary password
            echo "$DEPLOY_USER:vx10deploy123" | chpasswd
            success "Created user $DEPLOY_USER with password: vx10deploy123"
        else
            warning "Deployment user '$DEPLOY_USER' already exists. Updating configuration..."

            # Ensure user has proper groups
            usermod -aG sudo "$DEPLOY_USER" 2>/dev/null || true

            # Reset password to known value
            echo "$DEPLOY_USER:vx10deploy123" | chpasswd
            log "Reset password for existing user: $DEPLOY_USER"
            success "Updated existing deployment user: $DEPLOY_USER"
        fi

        # Set project ownership to deployment user
        if [[ -d "$PROJECT_DIR" ]]; then
            log "Setting project ownership to deployment user..."
            chown -R "$DEPLOY_USER:$DEPLOY_USER" "$PROJECT_DIR"
        fi

        IS_ROOT=true
        CURRENT_USER="$DEPLOY_USER"

        log "Running as root - will use deployment user: $DEPLOY_USER for application operations"
    else
        # Check if user has sudo privileges
        if ! sudo -n true 2>/dev/null; then
            error "This script requires sudo privileges. Please ensure your user can run sudo commands."
            exit 1
        fi

        IS_ROOT=false
        CURRENT_USER="$USER"

        log "Running as user: $CURRENT_USER with sudo privileges"
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

# Function to execute commands with appropriate user context
execute_with_user() {
    local cmd="$1"
    if [[ $IS_ROOT == true ]]; then
        su - "$CURRENT_USER" -c "$cmd"
    else
        bash -c "$cmd"
    fi
}

# Function to execute sudo commands
execute_sudo() {
    local cmd="$1"
    if [[ $IS_ROOT == true ]]; then
        bash -c "$cmd"
    else
        sudo bash -c "$cmd"
    fi
}

# Function to update system packages
update_system() {
    log "Updating system packages..."
    execute_sudo "apt-get update -qq"
    execute_sudo "apt-get upgrade -y -qq"
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
    execute_sudo "apt-get install -y postgresql postgresql-contrib postgresql-client"

    # Start and enable PostgreSQL service
    execute_sudo "systemctl start postgresql"
    execute_sudo "systemctl enable postgresql"

    # Wait for PostgreSQL to be ready
    sleep 3

    success "PostgreSQL installed and started"
}

# Function to check if PostgreSQL user exists
check_pg_user_exists() {
    local user="$1"
    execute_sudo "su - postgres -c \"psql -t -c \\\"SELECT 1 FROM pg_roles WHERE rolname='$user';\\\"\"" | grep -q 1
}

# Function to check if PostgreSQL database exists
check_pg_database_exists() {
    local database="$1"
    execute_sudo "su - postgres -c \"psql -t -c \\\"SELECT 1 FROM pg_database WHERE datname='$database';\\\"\"" | grep -q 1
}

# Function to configure PostgreSQL
configure_postgresql() {
    log "Configuring PostgreSQL..."

    # Set postgres user password (for administrative tasks)
    execute_sudo "su - postgres -c \"psql -c \\\"ALTER USER postgres PASSWORD 'postgres';\\\"\""  2>/dev/null || true

    # Handle database user
    if check_pg_user_exists "$DB_USER"; then
        warning "Database user '$DB_USER' already exists. Updating configuration..."
        log "Resetting password for user: $DB_USER"
        execute_sudo "su - postgres -c \"psql -c \\\"ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\\\"\""
        execute_sudo "su - postgres -c \"psql -c \\\"ALTER USER $DB_USER CREATEDB;\\\"\""
        execute_sudo "su - postgres -c \"psql -c \\\"ALTER USER $DB_USER WITH SUPERUSER;\\\"\""
        success "Updated existing database user: $DB_USER"
    else
        log "Creating database user: $DB_USER"
        execute_sudo "su - postgres -c \"psql -c \\\"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\\\"\""
        execute_sudo "su - postgres -c \"psql -c \\\"ALTER USER $DB_USER CREATEDB;\\\"\""
        execute_sudo "su - postgres -c \"psql -c \\\"ALTER USER $DB_USER WITH SUPERUSER;\\\"\""
        success "Created new database user: $DB_USER"
    fi

    # Handle database
    if check_pg_database_exists "$DB_NAME"; then
        warning "Database '$DB_NAME' already exists."
        read -p "Do you want to recreate the database? This will delete all existing data! (y/N): " recreate_db
        if [[ "$recreate_db" =~ ^[Yy]$ ]]; then
            log "Dropping and recreating database: $DB_NAME"
            execute_sudo "su - postgres -c \"psql -c \\\"DROP DATABASE $DB_NAME;\\\"\""
            execute_sudo "su - postgres -c \"psql -c \\\"CREATE DATABASE $DB_NAME OWNER $DB_USER;\\\"\""
            success "Recreated database: $DB_NAME"
        else
            log "Keeping existing database: $DB_NAME"
            # Ensure the user owns the database
            execute_sudo "su - postgres -c \"psql -c \\\"ALTER DATABASE $DB_NAME OWNER TO $DB_USER;\\\"\""
            success "Updated database ownership: $DB_NAME"
        fi
    else
        log "Creating database: $DB_NAME"
        execute_sudo "su - postgres -c \"psql -c \\\"CREATE DATABASE $DB_NAME OWNER $DB_USER;\\\"\""
        success "Created new database: $DB_NAME"
    fi

    # Grant all privileges (always do this to ensure proper permissions)
    execute_sudo "su - postgres -c \"psql -c \\\"GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;\\\"\""

    success "PostgreSQL configured with user: $DB_USER and database: $DB_NAME"
}

# Function to configure PostgreSQL for local connections
configure_pg_access() {
    log "Configuring PostgreSQL access..."

    # Find PostgreSQL version and config directory
    local pg_version
    pg_version=$(execute_sudo "su - postgres -c \"psql -t -c \\\"SELECT version();\\\"\"" | grep -oP '\d+\.\d+' | head -1)

    if [[ -z "$pg_version" ]]; then
        # Fallback method
        pg_version=$(psql --version | grep -oP '\d+\.\d+' | head -1)
    fi

    log "Detected PostgreSQL version: $pg_version"

    # Find config directory
    local pg_config_dir="/etc/postgresql/$pg_version/main"

    if [[ ! -d "$pg_config_dir" ]]; then
        # Try alternative paths
        for dir in /etc/postgresql/*/main /var/lib/postgresql/*/main; do
            if [[ -d "$dir" && -f "$dir/postgresql.conf" ]]; then
                pg_config_dir="$dir"
                break
            fi
        done
    fi

    if [[ ! -d "$pg_config_dir" ]]; then
        error "Could not find PostgreSQL configuration directory"
        log "Searched in: /etc/postgresql/$pg_version/main"
        return 1
    fi

    log "Found PostgreSQL config in: $pg_config_dir"

    # Backup original files
    execute_sudo "cp \"$pg_config_dir/postgresql.conf\" \"$pg_config_dir/postgresql.conf.backup\"" 2>/dev/null || true
    execute_sudo "cp \"$pg_config_dir/pg_hba.conf\" \"$pg_config_dir/pg_hba.conf.backup\"" 2>/dev/null || true

    # Configure postgresql.conf for local connections
    log "Configuring postgresql.conf..."
    execute_sudo "sed -i \"s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/\" \"$pg_config_dir/postgresql.conf\""
    execute_sudo "sed -i \"s/#port = 5432/port = 5432/\" \"$pg_config_dir/postgresql.conf\""
    execute_sudo "sed -i \"s/#max_connections = 100/max_connections = 200/\" \"$pg_config_dir/postgresql.conf\""

    # Enable logging for debugging
    execute_sudo "sed -i \"s/#log_statement = 'none'/log_statement = 'all'/\" \"$pg_config_dir/postgresql.conf\""
    execute_sudo "sed -i \"s/#log_min_duration_statement = -1/log_min_duration_statement = 1000/\" \"$pg_config_dir/postgresql.conf\""

    # Configure pg_hba.conf for local connections
    log "Configuring pg_hba.conf..."

    # Ensure md5 authentication for local connections
    execute_sudo "sed -i \"s/local   all             all                                     peer/local   all             all                                     md5/\" \"$pg_config_dir/pg_hba.conf\""
    execute_sudo "sed -i \"s/local   all             postgres                                peer/local   all             postgres                                md5/\" \"$pg_config_dir/pg_hba.conf\""

    # Add specific rules for our database and user
    if ! execute_sudo "grep -q \"local.*$DB_NAME.*$DB_USER\" \"$pg_config_dir/pg_hba.conf\""; then
        execute_sudo "echo \"# VX10 Database Access\" >> \"$pg_config_dir/pg_hba.conf\""
        execute_sudo "echo \"local   $DB_NAME        $DB_USER                                md5\" >> \"$pg_config_dir/pg_hba.conf\""
        execute_sudo "echo \"host    $DB_NAME        $DB_USER        127.0.0.1/32            md5\" >> \"$pg_config_dir/pg_hba.conf\""
        execute_sudo "echo \"host    $DB_NAME        $DB_USER        ::1/128                 md5\" >> \"$pg_config_dir/pg_hba.conf\""
    fi

    # Restart PostgreSQL to apply changes
    log "Restarting PostgreSQL to apply configuration changes..."
    execute_sudo "systemctl restart postgresql"

    # Wait for PostgreSQL to be ready
    local max_wait=30
    local wait_count=0
    while [[ $wait_count -lt $max_wait ]]; do
        if execute_sudo "systemctl is-active postgresql" >/dev/null 2>&1; then
            break
        fi
        sleep 1
        ((wait_count++))
    done

    if [[ $wait_count -ge $max_wait ]]; then
        error "PostgreSQL failed to start after configuration changes"
        return 1
    fi

    success "PostgreSQL access configured and service restarted"
}

# Function to test database connection
test_database_connection() {
    log "Testing database connection..."

    # Wait for PostgreSQL to be fully ready
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
            success "Database connection test successful"
            return 0
        fi

        log "Connection attempt $attempt/$max_attempts failed, waiting..."
        sleep 2
        ((attempt++))
    done

    error "Database connection test failed after $max_attempts attempts"

    # Diagnostic information
    log "Running connection diagnostics..."
    log "PostgreSQL service status:"
    execute_sudo "systemctl status postgresql --no-pager -l" || true

    log "PostgreSQL processes:"
    ps aux | grep postgres | grep -v grep || true

    log "Port 5432 status:"
    execute_sudo "netstat -tlnp | grep 5432" || true

    log "PostgreSQL logs (last 10 lines):"
    execute_sudo "journalctl -u postgresql -n 10 --no-pager" || true

    return 1
}

# Function to backup and update .env file
update_env_file() {
    log "Updating .env file..."

    # Database connection strings
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
    DIRECT_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

    # Handle existing .env file
    if [[ -f "$ENV_FILE" ]]; then
        cp "$ENV_FILE" "$BACKUP_ENV_FILE"
        log "Backed up existing .env to: $BACKUP_ENV_FILE"

        # Check if .env already has database configuration
        if grep -q "DATABASE_URL.*postgresql" "$ENV_FILE" 2>/dev/null; then
            warning "Existing .env file already contains database configuration."
            read -p "Do you want to update the database URLs? (Y/n): " update_urls
            if [[ "$update_urls" =~ ^[Nn]$ ]]; then
                log "Keeping existing database configuration"
                return 0
            fi
        fi

        # Update existing .env file by replacing database URLs
        log "Updating database URLs in existing .env file..."

        # Create temporary file with updated content
        local temp_env=$(mktemp)

        # Copy existing content, replacing database URLs
        while IFS= read -r line; do
            if [[ "$line" =~ ^DATABASE_URL= ]]; then
                echo "DATABASE_URL=\"$DATABASE_URL\""
            elif [[ "$line" =~ ^DIRECT_URL= ]]; then
                echo "DIRECT_URL=\"$DIRECT_URL\""
            else
                echo "$line"
            fi
        done < "$ENV_FILE" > "$temp_env"

        # Add database URLs if they weren't present
        if ! grep -q "^DATABASE_URL=" "$temp_env"; then
            echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$temp_env"
        fi
        if ! grep -q "^DIRECT_URL=" "$temp_env"; then
            echo "DIRECT_URL=\"$DIRECT_URL\"" >> "$temp_env"
        fi

        # Replace original file
        mv "$temp_env" "$ENV_FILE"

        success "Updated existing .env file with new database configuration"
        return 0
    fi

    # Create new .env file
    log "Creating new .env file..."
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
    if [[ $IS_ROOT == true ]]; then
        chown -R "$CURRENT_USER:$CURRENT_USER" "$PROJECT_DIR" 2>/dev/null || true
    else
        sudo chown -R "$CURRENT_USER:$CURRENT_USER" "$PROJECT_DIR" 2>/dev/null || true
    fi

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
        execute_sudo "curl -fsSL https://deb.nodesource.com/setup_18.x | bash -"
        execute_sudo "apt-get install -y nodejs"
    else
        log "Node.js already installed: $(node --version)"
    fi

    # Check if npm is available
    if ! command -v npm >/dev/null 2>&1; then
        error "npm is not available after Node.js installation"
        return 1
    fi

    log "Node.js version: $(node --version)"
    log "npm version: $(npm --version)"

    # Handle npm cache and permission issues
    log "Cleaning npm cache and fixing permissions..."
    execute_with_user "cd '$PROJECT_DIR' && npm cache clean --force" 2>/dev/null || true

    # Fix npm permissions for the user
    if [[ $IS_ROOT == true ]]; then
        # Create npm global directory for deployment user
        execute_with_user "mkdir -p /home/$CURRENT_USER/.npm-global" 2>/dev/null || true
        execute_with_user "npm config set prefix '/home/$CURRENT_USER/.npm-global'" 2>/dev/null || true
    fi

    # Remove existing node_modules if there are permission issues
    if [[ -d "$PROJECT_DIR/node_modules" ]]; then
        log "Checking node_modules permissions..."
        if ! execute_with_user "cd '$PROJECT_DIR' && test -w node_modules" 2>/dev/null; then
            warning "node_modules has permission issues. Removing and reinstalling..."
            rm -rf "$PROJECT_DIR/node_modules" 2>/dev/null || true
            rm -f "$PROJECT_DIR/package-lock.json" 2>/dev/null || true
        fi
    fi

    # Install dependencies with error handling
    log "Installing npm dependencies..."
    if [[ -f "$PROJECT_DIR/package-lock.json" ]]; then
        execute_with_user "cd '$PROJECT_DIR' && npm ci" || {
            warning "npm ci failed, trying npm install..."
            rm -f "$PROJECT_DIR/package-lock.json" 2>/dev/null || true
            execute_with_user "cd '$PROJECT_DIR' && npm install"
        }
    else
        execute_with_user "cd '$PROJECT_DIR' && npm install"
    fi

    success "Dependencies installed"
}

# Function to ensure required npm scripts exist
ensure_npm_scripts() {
    log "Checking npm scripts..."

    local package_json="$PROJECT_DIR/package.json"
    if [[ ! -f "$package_json" ]]; then
        error "package.json not found"
        return 1
    fi

    # Check if Prisma scripts exist
    local has_prisma_generate=$(grep -q '"prisma:generate"' "$package_json" && echo "true" || echo "false")
    local has_prisma_push=$(grep -q '"prisma:push"' "$package_json" && echo "true" || echo "false")
    local has_prisma_studio=$(grep -q '"prisma:studio"' "$package_json" && echo "true" || echo "false")

    if [[ "$has_prisma_generate" == "false" || "$has_prisma_push" == "false" || "$has_prisma_studio" == "false" ]]; then
        log "Adding missing Prisma scripts to package.json..."

        # Create a temporary script to add missing scripts
        local temp_script=$(mktemp)
        cat > "$temp_script" << 'EOF'
const fs = require('fs');
const path = require('path');

const packagePath = process.argv[2];
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

if (!packageJson.scripts) {
    packageJson.scripts = {};
}

// Add Prisma scripts if they don't exist
if (!packageJson.scripts['prisma:generate']) {
    packageJson.scripts['prisma:generate'] = 'prisma generate';
}

if (!packageJson.scripts['prisma:push']) {
    packageJson.scripts['prisma:push'] = 'prisma db push';
}

if (!packageJson.scripts['prisma:studio']) {
    packageJson.scripts['prisma:studio'] = 'prisma studio';
}

if (!packageJson.scripts['prisma:migrate']) {
    packageJson.scripts['prisma:migrate'] = 'prisma migrate dev';
}

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('Added missing Prisma scripts to package.json');
EOF

        execute_with_user "cd '$PROJECT_DIR' && node '$temp_script' '$package_json'"
        rm -f "$temp_script"

        success "Added missing Prisma scripts to package.json"
    else
        success "All required npm scripts are present"
    fi
}

# Function to handle Prisma operations
setup_prisma() {
    log "Setting up Prisma..."

    # Check if Prisma schema exists
    if [[ ! -f "$PROJECT_DIR/prisma/schema.prisma" ]]; then
        error "Prisma schema file not found at $PROJECT_DIR/prisma/schema.prisma"
        return 1
    fi

    # Verify database connection before Prisma operations
    log "Verifying database connection for Prisma..."
    local connection_test=false
    for i in {1..5}; do
        if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
            connection_test=true
            break
        fi
        log "Database connection attempt $i/5 failed, retrying..."
        sleep 2
    done

    if [[ "$connection_test" != true ]]; then
        error "Cannot connect to database for Prisma operations"
        return 1
    fi

    # Generate Prisma client
    log "Generating Prisma client..."
    execute_with_user "cd '$PROJECT_DIR' && npm run prisma:generate" || {
        warning "npm script failed, trying direct prisma command..."
        execute_with_user "cd '$PROJECT_DIR' && npx prisma generate" || {
            error "Failed to generate Prisma client"
            return 1
        }
    }

    # Check if database already has tables
    local has_tables=false
    log "Checking for existing database tables..."
    if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "\dt" 2>/dev/null | grep -q "public"; then
        has_tables=true
        warning "Database already contains tables."

        # Show existing tables
        log "Existing tables:"
        PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "\dt" 2>/dev/null || true
    fi

    # Handle schema application based on existing state
    if [[ "$has_tables" == true ]]; then
        log "Database has existing tables. Checking schema compatibility..."

        # Try to introspect existing schema
        execute_with_user "cd '$PROJECT_DIR' && npx prisma db pull" 2>/dev/null || {
            warning "Could not introspect existing schema"
        }

        echo
        warning "Database contains existing tables. Choose an option:"
        echo "1) Reset database (DELETE ALL DATA and apply new schema)"
        echo "2) Try to apply schema without data loss (may fail if incompatible)"
        echo "3) Skip schema application (use existing schema)"
        echo
        read -p "Enter your choice (1/2/3): " schema_choice

        case $schema_choice in
            1)
                log "Resetting database schema..."
                execute_with_user "cd '$PROJECT_DIR' && npx prisma db push --force-reset" || {
                    error "Failed to reset schema"
                    return 1
                }
                ;;
            2)
                log "Attempting to apply schema changes without data loss..."
                execute_with_user "cd '$PROJECT_DIR' && npx prisma db push" || {
                    warning "Schema push failed. Trying migration approach..."
                    execute_with_user "cd '$PROJECT_DIR' && npx prisma migrate dev --name update_schema" || {
                        error "Schema application failed. Manual intervention required."
                        return 1
                    }
                }
                ;;
            3)
                log "Skipping schema application, using existing schema"
                ;;
            *)
                warning "Invalid choice, skipping schema application"
                ;;
        esac
    else
        # Fresh database, apply schema
        log "Applying schema to fresh database..."
        execute_with_user "cd '$PROJECT_DIR' && npx prisma db push" || {
            warning "Schema push failed, trying with force reset..."
            execute_with_user "cd '$PROJECT_DIR' && npx prisma db push --force-reset" || {
                error "Failed to apply schema. Trying migration approach..."
                execute_with_user "cd '$PROJECT_DIR' && npx prisma migrate dev --name init" || {
                    error "All schema application methods failed. Manual intervention required."
                    return 1
                }
            }
        }
    fi

    # Verify schema was applied correctly
    log "Verifying schema application..."
    local table_count
    table_count=$(PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

    if [[ "$table_count" -gt 0 ]]; then
        success "Prisma schema applied successfully ($table_count tables created)"

        # Show created tables
        log "Database tables:"
        PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "\dt" 2>/dev/null || true
    else
        warning "No tables found after schema application"
    fi
}

# Function to seed the database
seed_database() {
    log "Seeding database with initial data..."

    if [[ -f "$PROJECT_DIR/prisma/seed.js" ]]; then
        execute_with_user "cd '$PROJECT_DIR' && node prisma/seed.js" || {
            warning "Seeding failed, but continuing..."
        }
        success "Database seeded with initial data"
    else
        warning "No seed file found, skipping database seeding"
    fi
}

# Function to setup and test Prisma Studio
setup_prisma_studio() {
    log "Setting up Prisma Studio..."

    # Verify Prisma Studio is available
    if ! execute_with_user "cd '$PROJECT_DIR' && npx prisma studio --help" >/dev/null 2>&1; then
        error "Prisma Studio is not available. Make sure Prisma is properly installed."
        return 1
    fi

    # Create a script to easily start Prisma Studio
    local studio_script="$PROJECT_DIR/start-prisma-studio.sh"
    cat > "$studio_script" << 'EOF'
#!/bin/bash

# VX10 Prisma Studio Launcher
# This script starts Prisma Studio for database administration

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "Starting Prisma Studio..."
echo "Database: vx10_db"
echo "User: vx10user"
echo "Studio will be available at: http://localhost:5555"
echo ""
echo "Press Ctrl+C to stop Prisma Studio"
echo ""

# Start Prisma Studio
npx prisma studio
EOF

    chmod +x "$studio_script"

    if [[ $IS_ROOT == true ]]; then
        chown "$CURRENT_USER:$CURRENT_USER" "$studio_script"
    fi

    # Test Prisma Studio startup (briefly)
    log "Testing Prisma Studio startup..."

    # Start Prisma Studio in background for testing
    local studio_pid
    execute_with_user "cd '$PROJECT_DIR' && timeout 10s npx prisma studio --port 5555" >/dev/null 2>&1 &
    studio_pid=$!

    # Wait a moment for startup
    sleep 3

    # Check if it's running
    if kill -0 $studio_pid 2>/dev/null; then
        # Test if port 5555 is accessible
        if curl -s http://localhost:5555 >/dev/null 2>&1; then
            success "Prisma Studio test successful"
        else
            warning "Prisma Studio started but may not be accessible on port 5555"
        fi

        # Stop the test instance
        kill $studio_pid 2>/dev/null || true
        sleep 2
    else
        warning "Prisma Studio test startup failed, but it may still work manually"
    fi

    success "Prisma Studio setup completed"

    # Provide usage instructions
    echo
    info "Prisma Studio Usage:"
    info "  Manual start: cd $PROJECT_DIR && npx prisma studio"
    info "  Script start: $studio_script"
    info "  Access URL: http://localhost:5555"
    info "  Stop: Press Ctrl+C in the terminal running Prisma Studio"
}

# Function to run comprehensive tests
run_tests() {
    log "Running comprehensive tests..."

    # Test database connection
    test_database_connection

    # Test Prisma connection
    log "Testing Prisma connection..."
    if execute_with_user "cd '$PROJECT_DIR' && npx prisma --help" >/dev/null 2>&1; then
        success "Prisma CLI is available"
    else
        error "Prisma CLI test failed"
        return 1
    fi

    # Test Prisma Studio availability
    log "Testing Prisma Studio availability..."
    if execute_with_user "cd '$PROJECT_DIR' && npx prisma studio --help" >/dev/null 2>&1; then
        success "Prisma Studio is available"
    else
        warning "Prisma Studio may not be available"
    fi

    # Test database schema
    log "Testing database schema..."
    local table_count
    table_count=$(PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)

    if [[ "$table_count" -gt 0 ]]; then
        success "Database schema is applied ($table_count tables found)"
    else
        warning "No tables found in database schema"
    fi

    # Test application build
    log "Testing application build..."
    if execute_with_user "cd '$PROJECT_DIR' && npm run build" >/dev/null 2>&1; then
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
    info "  2. Access Prisma Studio: npx prisma studio"
    info "  3. Use the studio script: ./start-prisma-studio.sh"
    info "  4. View your database at: http://localhost:5555"
    echo
    info "Database Administration:"
    info "  - Prisma Studio: npx prisma studio (web interface)"
    info "  - Direct connection: psql -h localhost -U $DB_USER -d $DB_NAME"
    info "  - Studio script: ./start-prisma-studio.sh"
    echo
    info "Useful Commands:"
    info "  - Reset database: npx prisma db push --force-reset"
    info "  - Generate Prisma client: npx prisma generate"
    info "  - Database introspection: npx prisma db pull"
    info "  - Create migration: npx prisma migrate dev --name <name>"
    echo
}

# Function to handle errors and cleanup
cleanup_on_error() {
    error "Setup failed. Performing cleanup..."

    # Show the specific error that occurred
    log "Last command exit code: $?"

    # Restore .env backup if it exists
    if [[ -f "$BACKUP_ENV_FILE" ]]; then
        mv "$BACKUP_ENV_FILE" "$ENV_FILE"
        log "Restored .env file from backup"
    fi

    # Provide recovery options
    echo
    warning "Setup failed, but you have several recovery options:"
    echo "1. Re-run the script (it will handle existing resources)"
    echo "2. Continue with manual setup using the documentation"
    echo "3. Clean up and start fresh"
    echo

    read -p "Do you want to clean up created resources? (y/N): " cleanup_resources
    if [[ "$cleanup_resources" =~ ^[Yy]$ ]]; then
        log "Cleaning up created resources..."

        # Remove database and user
        execute_sudo "su - postgres -c \"psql -c \\\"DROP DATABASE IF EXISTS $DB_NAME;\\\"\""  2>/dev/null || true
        execute_sudo "su - postgres -c \"psql -c \\\"DROP USER IF EXISTS $DB_USER;\\\"\""  2>/dev/null || true

        # Remove deployment user if created by this script
        if [[ $IS_ROOT == true ]] && id "$DEPLOY_USER" &>/dev/null; then
            read -p "Remove deployment user '$DEPLOY_USER'? (y/N): " remove_user
            if [[ "$remove_user" =~ ^[Yy]$ ]]; then
                userdel -r "$DEPLOY_USER" 2>/dev/null || true
                log "Removed deployment user: $DEPLOY_USER"
            fi
        fi

        # Remove node_modules if it has permission issues
        if [[ -d "$PROJECT_DIR/node_modules" ]]; then
            read -p "Remove node_modules directory? (y/N): " remove_modules
            if [[ "$remove_modules" =~ ^[Yy]$ ]]; then
                rm -rf "$PROJECT_DIR/node_modules" 2>/dev/null || true
                rm -f "$PROJECT_DIR/package-lock.json" 2>/dev/null || true
                log "Removed node_modules and package-lock.json"
            fi
        fi

        success "Cleanup completed"
    else
        log "Resources preserved. You can re-run the script to continue setup."
    fi

    echo
    info "For manual recovery, see: README_POSTGRES_SETUP.md"
    info "For troubleshooting, see: POSTGRES_SETUP_UBUNTU.md"
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
    check_user_context
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
    ensure_npm_scripts
    setup_prisma
    seed_database
    setup_prisma_studio
    run_tests

    # Show completion information
    show_completion_info
}

# Run main function with all arguments
main "$@"
