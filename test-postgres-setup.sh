#!/bin/bash

# Test script for PostgreSQL setup verification
# Run this after setup-postgres-ubuntu.sh to verify everything works

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (should match setup script)
DB_NAME="vx10_db"
DB_USER="vx10user"
DB_PASSWORD="vx10password"
PROJECT_DIR="$(pwd)"
ENV_FILE="$PROJECT_DIR/.env"

# Logging functions
log() {
    echo -e "${GREEN}[TEST]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Test functions
test_postgresql_service() {
    log "Testing PostgreSQL service..."
    
    if sudo systemctl is-active postgresql >/dev/null 2>&1; then
        success "PostgreSQL service is running"
    else
        error "PostgreSQL service is not running"
        return 1
    fi
}

test_database_connection() {
    log "Testing database connection..."
    
    if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        success "Database connection successful"
    else
        error "Database connection failed"
        return 1
    fi
}

test_env_file() {
    log "Testing .env file configuration..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        error ".env file not found"
        return 1
    fi
    
    if grep -q "DATABASE_URL.*postgresql.*$DB_USER.*$DB_PASSWORD.*localhost.*$DB_NAME" "$ENV_FILE"; then
        success ".env file contains correct DATABASE_URL"
    else
        error ".env file does not contain correct DATABASE_URL"
        return 1
    fi
    
    if grep -q "DIRECT_URL.*postgresql.*$DB_USER.*$DB_PASSWORD.*localhost.*$DB_NAME" "$ENV_FILE"; then
        success ".env file contains correct DIRECT_URL"
    else
        error ".env file does not contain correct DIRECT_URL"
        return 1
    fi
}

test_prisma_client() {
    log "Testing Prisma client..."
    
    if [[ ! -d "node_modules/@prisma/client" ]]; then
        error "Prisma client not found in node_modules"
        return 1
    fi
    
    if npm run prisma:generate >/dev/null 2>&1; then
        success "Prisma client generation successful"
    else
        error "Prisma client generation failed"
        return 1
    fi
}

test_database_schema() {
    log "Testing database schema..."
    
    # Check if main tables exist
    local tables=("users" "lessons" "packages" "bookings" "credits")
    
    for table in "${tables[@]}"; do
        if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "\dt $table" | grep -q "$table"; then
            success "Table '$table' exists"
        else
            error "Table '$table' does not exist"
            return 1
        fi
    done
}

test_database_data() {
    log "Testing database data..."
    
    # Check if settings table has data
    local settings_count=$(PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM settings;" 2>/dev/null | xargs)
    
    if [[ "$settings_count" -gt 0 ]]; then
        success "Database contains seeded data ($settings_count settings records)"
    else
        warning "Database appears to be empty (no settings records found)"
    fi
}

test_application_build() {
    log "Testing application build..."
    
    if npm run build >/dev/null 2>&1; then
        success "Application builds successfully"
    else
        warning "Application build failed (this may be due to other issues, not database)"
    fi
}

test_prisma_studio() {
    log "Testing Prisma Studio access..."
    
    # Start Prisma Studio in background and test if it starts
    timeout 10s npm run prisma:studio >/dev/null 2>&1 &
    local studio_pid=$!
    
    sleep 3
    
    if kill -0 $studio_pid 2>/dev/null; then
        success "Prisma Studio can start"
        kill $studio_pid 2>/dev/null || true
    else
        error "Prisma Studio failed to start"
        return 1
    fi
}

# Performance tests
test_database_performance() {
    log "Testing database performance..."
    
    local start_time=$(date +%s%N)
    PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM users;" >/dev/null 2>&1
    local end_time=$(date +%s%N)
    
    local duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    if [[ $duration -lt 1000 ]]; then
        success "Database query performance good (${duration}ms)"
    else
        warning "Database query performance slow (${duration}ms)"
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  VX10 PostgreSQL Setup Test   ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
    
    local failed_tests=0
    
    # Run all tests
    test_postgresql_service || ((failed_tests++))
    test_database_connection || ((failed_tests++))
    test_env_file || ((failed_tests++))
    test_prisma_client || ((failed_tests++))
    test_database_schema || ((failed_tests++))
    test_database_data
    test_application_build
    test_prisma_studio || ((failed_tests++))
    test_database_performance
    
    echo
    echo -e "${BLUE}================================${NC}"
    
    if [[ $failed_tests -eq 0 ]]; then
        success "🎉 All critical tests passed! PostgreSQL setup is working correctly."
        echo
        echo -e "${GREEN}You can now:${NC}"
        echo "  • Start your application: npm run dev"
        echo "  • Access Prisma Studio: npm run prisma:studio"
        echo "  • Connect to database: psql -h localhost -U $DB_USER -d $DB_NAME"
    else
        error "❌ $failed_tests critical test(s) failed. Please check the setup."
        echo
        echo -e "${RED}Common solutions:${NC}"
        echo "  • Re-run the setup script: ./setup-postgres-ubuntu.sh"
        echo "  • Check PostgreSQL service: sudo systemctl status postgresql"
        echo "  • Verify .env file configuration"
        echo "  • Run Prisma commands manually: npm run prisma:push"
        exit 1
    fi
}

# Run main function
main "$@"
