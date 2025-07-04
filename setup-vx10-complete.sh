#!/bin/bash

# VX10 Complete Setup Script
# Works on Windows (Git Bash), Linux, and macOS
# Author: VX10 Team
# Description: Complete setup script for VX10 project including git, dependencies, and PostgreSQL

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
PROJECT_NAME="vx10-project"
REPO_URL="https://github.com/wagmicrew/vx10.git"
DEFAULT_BRANCH="master"

# Detect OS
detect_os() {
    case "$(uname -s)" in
        Linux*)     OS=linux;;
        Darwin*)    OS=macos;;
        CYGWIN*|MINGW*|MSYS*)    OS=windows;;
        *)          OS=unknown;;
    esac
    echo "$OS"
}

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

# Function to install Node.js and npm based on OS
install_nodejs() {
    local os=$(detect_os)
    
    if command_exists node && command_exists npm; then
        info "Node.js and npm are already installed"
        log "Node.js version: $(node --version)"
        log "npm version: $(npm --version)"
        return 0
    fi
    
    log "Installing Node.js and npm..."
    
    case $os in
        linux)
            # Install Node.js via NodeSource repository
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        macos)
            if command_exists brew; then
                brew install node
            else
                error "Homebrew not found. Please install Node.js manually from https://nodejs.org/"
                return 1
            fi
            ;;
        windows)
            warning "Please install Node.js manually from https://nodejs.org/ if not already installed"
            if ! command_exists node; then
                error "Node.js not found. Please install it and restart this script."
                return 1
            fi
            ;;
        *)
            error "Unsupported OS. Please install Node.js manually from https://nodejs.org/"
            return 1
            ;;
    esac
    
    success "Node.js and npm installed successfully!"
}

# Function to install PostgreSQL based on OS
install_postgresql() {
    local os=$(detect_os)
    
    if command_exists psql; then
        info "PostgreSQL is already installed"
        return 0
    fi
    
    log "Installing PostgreSQL..."
    
    case $os in
        linux)
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
        macos)
            if command_exists brew; then
                brew install postgresql
                brew services start postgresql
            else
                error "Homebrew not found. Please install PostgreSQL manually"
                return 1
            fi
            ;;
        windows)
            warning "PostgreSQL installation on Windows should be done via the PowerShell script or manually"
            warning "Running PowerShell setup script..."
            if [ -f "setup_postgres.ps1" ]; then
                powershell.exe -ExecutionPolicy Bypass -File "./setup_postgres.ps1"
                return $?
            else
                error "setup_postgres.ps1 not found. Please install PostgreSQL manually."
                return 1
            fi
            ;;
        *)
            error "Unsupported OS for automatic PostgreSQL installation"
            return 1
            ;;
    esac
    
    success "PostgreSQL installed successfully!"
}

# Function to setup PostgreSQL database and user
setup_postgresql_db() {
    local os=$(detect_os)
    
    log "Setting up PostgreSQL database and user..."
    
    case $os in
        linux|macos)
            # Create user and database
            sudo -u postgres createuser --createdb --pwprompt vx10user 2>/dev/null || true
            sudo -u postgres createdb -O vx10user vx10_db 2>/dev/null || true
            
            # Set password for user
            sudo -u postgres psql -c "ALTER USER vx10user PASSWORD 'vx10password';" 2>/dev/null || true
            ;;
        windows)
            # Use PowerShell script for Windows
            log "Using PowerShell script for database setup on Windows..."
            if [ -f "setup_postgres.ps1" ]; then
                powershell.exe -ExecutionPolicy Bypass -File "./setup_postgres.ps1"
                return $?
            fi
            ;;
    esac
    
    success "PostgreSQL database setup completed!"
}

# Function to check and install prerequisites
install_prerequisites() {
    local os=$(detect_os)
    
    log "Installing prerequisites for $os..."
    
    # Install git if not present
    if ! command_exists git; then
        case $os in
            linux)
                sudo apt-get update
                sudo apt-get install -y git curl
                ;;
            macos)
                if command_exists brew; then
                    brew install git
                else
                    error "Please install git manually"
                    return 1
                fi
                ;;
            windows)
                error "Git not found. Please install Git for Windows."
                return 1
                ;;
        esac
    fi
    
    # Install Node.js and npm
    install_nodejs
    
    # Install PostgreSQL
    install_postgresql
    
    success "Prerequisites installed successfully!"
}

# Function to clone or update repository
setup_repository() {
    local target_dir="$1"
    
    if [ -d "$target_dir" ]; then
        warning "Directory $target_dir already exists."
        read -p "Do you want to update the existing repository? (y/N): " update_repo
        
        if [[ "$update_repo" =~ ^[Yy]$ ]]; then
            log "Updating existing repository..."
            cd "$target_dir"
            
            # Stash any local changes
            if [ -n "$(git status --porcelain)" ]; then
                log "Stashing local changes..."
                git stash push -m "Auto-stash before update $(date)"
            fi
            
            # Fetch and pull latest changes
            git fetch origin
            git pull origin "$DEFAULT_BRANCH"
            
            success "Repository updated successfully!"
        else
            info "Using existing repository without updating."
            cd "$target_dir"
        fi
    else
        log "Cloning repository from $REPO_URL..."
        git clone "$REPO_URL" "$target_dir"
        cd "$target_dir"
        success "Repository cloned successfully!"
    fi
}

# Function to setup environment file
setup_environment() {
    log "Setting up environment variables..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp ".env.example" ".env"
            log "Created .env from .env.example"
        else
            # Create basic .env file
            cat > .env << EOF
# Database
DATABASE_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# App
NODE_ENV="development"
EOF
            log "Created basic .env file"
        fi
    else
        info ".env file already exists"
    fi
    
    # Update DATABASE_URL if needed
    if ! grep -q "postgresql://vx10user:vx10password@localhost:5432/vx10_db" .env; then
        log "Updating DATABASE_URL in .env..."
        sed -i.bak 's|DATABASE_URL=.*|DATABASE_URL="postgresql://vx10user:vx10password@localhost:5432/vx10_db"|' .env
    fi
    
    success "Environment setup completed!"
}

# Function to install dependencies and build
install_and_build() {
    log "Installing project dependencies..."
    
    # Clear npm cache
    npm cache clean --force
    
    # Install dependencies
    npm ci
    
    log "Generating Prisma client..."
    npx prisma generate
    
    log "Running database migrations..."
    npx prisma migrate deploy || npx prisma db push
    
    log "Building the project..."
    npm run build
    
    success "Project built successfully!"
}

# Function to create test data
create_test_data() {
    log "Creating test users..."
    
    # Create a temporary Node.js script to create test users
    cat > create_test_users.js << 'EOF'
const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test users...');
  
  const users = [
    {
      id: 'admin-id-001',
      name: 'Admin User',
      email: 'admin@vx10.com',
      password: await bcrypt.hash('admin', 12),
      role: 'ADMIN'
    },
    {
      id: 'teacher-id-001',
      name: 'Teacher User',
      email: 'teacher@vx10.com',
      password: await bcrypt.hash('teacher', 12),
      role: 'TEACHER'
    },
    {
      id: 'student-id-001',
      name: 'Student User',
      email: 'student@vx10.com',
      password: await bcrypt.hash('student', 12),
      role: 'STUDENT'
    }
  ];
  
  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: user.password,
        updatedAt: new Date()
      },
      create: user
    });
    console.log(`Created/updated user: ${user.email}`);
  }
  
  console.log('Test users created successfully!');
}

main()
  .catch((e) => {
    console.error('Error creating test users:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF
    
    # Run the script
    node create_test_users.js
    
    # Clean up
    rm create_test_users.js
    
    success "Test users created successfully!"
    info "Admin: admin@vx10.com / admin"
    info "Teacher: teacher@vx10.com / teacher"
    info "Student: student@vx10.com / student"
}

# Function to commit and push changes
commit_and_push() {
    log "Committing and pushing changes..."
    
    # Check if there are any changes
    if [ -n "$(git status --porcelain)" ]; then
        log "Local changes detected. Committing..."
        
        # Add all changes
        git add .
        
        # Commit with timestamp
        local commit_msg="Setup: Complete VX10 installation and configuration - $(date)"
        git commit -m "$commit_msg"
        
        # Push to remote
        log "Pushing to remote repository..."
        git push origin "$DEFAULT_BRANCH"
        
        success "Changes committed and pushed successfully!"
    else
        info "No local changes to commit."
    fi
}

# Function to start the application
start_application() {
    log "Starting the application..."
    
    # Check if PM2 is available
    if command_exists pm2; then
        log "Using PM2 to start the application..."
        pm2 start npm --name "vx10" -- start
        pm2 save
        success "Application started with PM2!"
        info "Use 'pm2 logs vx10' to view logs"
        info "Use 'pm2 stop vx10' to stop the application"
    else
        log "PM2 not found. Starting with npm..."
        warning "The application will stop when you close this terminal."
        info "Consider installing PM2 globally: npm install -g pm2"
        npm start
    fi
}

# Main setup function
main_setup() {
    local target_dir="${1:-$PROJECT_NAME}"
    
    echo -e "${MAGENTA}================================${NC}"
    echo -e "${MAGENTA}    VX10 Complete Setup Script   ${NC}"
    echo -e "${MAGENTA}================================${NC}"
    echo
    
    log "Detected OS: $(detect_os)"
    log "Target directory: $target_dir"
    echo
    
    # Step 1: Install prerequisites
    log "Step 1: Installing prerequisites..."
    install_prerequisites
    
    # Step 2: Setup repository
    log "Step 2: Setting up repository..."
    setup_repository "$target_dir"
    
    # Step 3: Setup environment
    log "Step 3: Setting up environment..."
    setup_environment
    
    # Step 4: Setup PostgreSQL database
    log "Step 4: Setting up PostgreSQL database..."
    setup_postgresql_db
    
    # Step 5: Install and build
    log "Step 5: Installing dependencies and building..."
    install_and_build
    
    # Step 6: Create test data
    log "Step 6: Creating test data..."
    create_test_data
    
    # Step 7: Commit and push changes
    log "Step 7: Committing and pushing changes..."
    commit_and_push
    
    echo
    success "🎉 VX10 setup completed successfully!"
    echo
    info "Next steps:"
    info "1. Navigate to the project directory: cd $target_dir"
    info "2. Start the development server: npm run dev"
    info "3. Open your browser to: http://localhost:3000"
    echo
    info "Test accounts:"
    info "  Admin: admin@vx10.com / admin"
    info "  Teacher: teacher@vx10.com / teacher"
    info "  Student: student@vx10.com / student"
    echo
    
    # Ask if user wants to start the application
    read -p "Do you want to start the application now? (y/N): " start_now
    if [[ "$start_now" =~ ^[Yy]$ ]]; then
        start_application
    else
        info "You can start the application later with: npm run dev"
    fi
}

# Function to show help
show_help() {
    echo "VX10 Complete Setup Script"
    echo
    echo "Usage: $0 [OPTIONS] [DIRECTORY]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -u, --update   Update existing installation"
    echo "  -f, --force    Force reinstall of components"
    echo
    echo "Examples:"
    echo "  $0                    # Setup in default directory (vx10-project)"
    echo "  $0 my-vx10          # Setup in custom directory"
    echo "  $0 --update         # Update existing installation"
    echo
}

# Function to update existing installation
update_installation() {
    local target_dir="${1:-$PROJECT_NAME}"
    
    if [ ! -d "$target_dir" ]; then
        error "Directory $target_dir does not exist. Use regular setup instead."
        exit 1
    fi
    
    log "Updating existing VX10 installation in $target_dir..."
    cd "$target_dir"
    
    # Stash local changes
    if [ -n "$(git status --porcelain)" ]; then
        log "Stashing local changes..."
        git stash push -m "Auto-stash before update $(date)"
    fi
    
    # Pull latest changes
    git fetch origin
    git pull origin "$DEFAULT_BRANCH"
    
    # Update dependencies
    npm ci
    
    # Run migrations
    npx prisma migrate deploy || npx prisma db push
    npx prisma generate
    
    # Build project
    npm run build
    
    # Commit and push if there are changes
    commit_and_push
    
    success "Update completed successfully!"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -u|--update)
        update_installation "${2:-$PROJECT_NAME}"
        exit 0
        ;;
    -f|--force)
        export FORCE_INSTALL=true
        main_setup "${2:-$PROJECT_NAME}"
        ;;
    *)
        main_setup "${1:-$PROJECT_NAME}"
        ;;
esac
