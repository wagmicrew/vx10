#!/bin/bash

# Comprehensive Database and Prisma Setup Test Script
# Tests PostgreSQL, Prisma, and Prisma Studio functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="vx10_db"
DB_USER="vx10user"
DB_PASSWORD="vx10password"
PROJECT_DIR="$(pwd)"

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

test_database_permissions() {
    log "Testing database permissions..."
    
    # Test CREATE permission
    if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "CREATE TABLE test_permissions (id SERIAL PRIMARY KEY);" >/dev/null 2>&1; then
        success "CREATE permission works"
        
        # Clean up test table
        PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "DROP TABLE test_permissions;" >/dev/null 2>&1
    else
        error "CREATE permission failed"
        return 1
    fi
}

test_prisma_client() {
    log "Testing Prisma client..."
    
    if [[ ! -d "node_modules/@prisma/client" ]]; then
        error "Prisma client not found in node_modules"
        return 1
    fi
    
    if npx prisma --version >/dev/null 2>&1; then
        local version=$(npx prisma --version | head -1)
        success "Prisma CLI available: $version"
    else
        error "Prisma CLI not available"
        return 1
    fi
}

test_prisma_schema() {
    log "Testing Prisma schema..."
    
    if [[ ! -f "prisma/schema.prisma" ]]; then
        error "Prisma schema file not found"
        return 1
    fi
    
    # Test schema validation
    if npx prisma validate >/dev/null 2>&1; then
        success "Prisma schema is valid"
    else
        error "Prisma schema validation failed"
        return 1
    fi
}

test_database_tables() {
    log "Testing database tables..."
    
    local table_count
    table_count=$(PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
    
    if [[ "$table_count" -gt 0 ]]; then
        success "Database contains $table_count tables"
        
        # List tables
        log "Database tables:"
        PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "\dt" 2>/dev/null || true
    else
        error "No tables found in database"
        return 1
    fi
}

test_prisma_studio() {
    log "Testing Prisma Studio..."
    
    # Check if Prisma Studio command is available
    if ! npx prisma studio --help >/dev/null 2>&1; then
        error "Prisma Studio command not available"
        return 1
    fi
    
    # Test if we can start Prisma Studio (briefly)
    log "Testing Prisma Studio startup..."
    
    # Start Prisma Studio in background
    timeout 15s npx prisma studio --port 5556 >/dev/null 2>&1 &
    local studio_pid=$!
    
    # Wait for startup
    sleep 5
    
    # Check if it's running and accessible
    if kill -0 $studio_pid 2>/dev/null; then
        if curl -s http://localhost:5556 >/dev/null 2>&1; then
            success "Prisma Studio is accessible at http://localhost:5556"
        else
            warning "Prisma Studio started but not accessible via HTTP"
        fi
        
        # Stop the test instance
        kill $studio_pid 2>/dev/null || true
        sleep 2
    else
        error "Prisma Studio failed to start"
        return 1
    fi
}

test_npm_scripts() {
    log "Testing npm scripts..."
    
    local scripts=("prisma:generate" "prisma:push" "prisma:studio")
    
    for script in "${scripts[@]}"; do
        if grep -q "\"$script\"" package.json 2>/dev/null; then
            success "npm script '$script' exists"
        else
            error "npm script '$script' missing"
            return 1
        fi
    done
}

test_prisma_generate() {
    log "Testing Prisma client generation..."
    
    if npm run prisma:generate >/dev/null 2>&1; then
        success "Prisma client generation successful"
    else
        error "Prisma client generation failed"
        return 1
    fi
}

test_data_operations() {
    log "Testing basic data operations..."
    
    # Test inserting data
    local test_sql="
    INSERT INTO settings (key, value, description) 
    VALUES ('test_key', 'test_value', 'Test setting for database verification')
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
    "
    
    if PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "$test_sql" >/dev/null 2>&1; then
        success "Data insertion test successful"
        
        # Test reading data
        local count
        count=$(PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM settings WHERE key = 'test_key';" 2>/dev/null | xargs)
        
        if [[ "$count" -eq 1 ]]; then
            success "Data reading test successful"
            
            # Clean up test data
            PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "DELETE FROM settings WHERE key = 'test_key';" >/dev/null 2>&1
        else
            error "Data reading test failed"
            return 1
        fi
    else
        error "Data insertion test failed"
        return 1
    fi
}

# Performance test
test_performance() {
    log "Testing database performance..."
    
    local start_time=$(date +%s%N)
    PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) FROM information_schema.tables;" >/dev/null 2>&1
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
    echo -e "${BLUE}  VX10 Database Setup Test     ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
    
    local failed_tests=0
    
    # Run all tests
    test_postgresql_service || ((failed_tests++))
    test_database_connection || ((failed_tests++))
    test_database_permissions || ((failed_tests++))
    test_prisma_client || ((failed_tests++))
    test_prisma_schema || ((failed_tests++))
    test_database_tables || ((failed_tests++))
    test_npm_scripts || ((failed_tests++))
    test_prisma_generate || ((failed_tests++))
    test_prisma_studio || ((failed_tests++))
    test_data_operations || ((failed_tests++))
    test_performance
    
    echo
    echo -e "${BLUE}================================${NC}"
    
    if [[ $failed_tests -eq 0 ]]; then
        success "🎉 All tests passed! Database and Prisma setup is working correctly."
        echo
        echo -e "${GREEN}You can now:${NC}"
        echo "  • Start your application: npm run dev"
        echo "  • Access Prisma Studio: npx prisma studio"
        echo "  • Use the studio script: ./start-prisma-studio.sh"
        echo "  • Connect directly: psql -h localhost -U $DB_USER -d $DB_NAME"
        echo "  • View at: http://localhost:5555 (when Prisma Studio is running)"
    else
        error "❌ $failed_tests test(s) failed. Please check the setup."
        echo
        echo -e "${RED}Common solutions:${NC}"
        echo "  • Re-run setup script: ./setup-postgres-ubuntu.sh"
        echo "  • Check PostgreSQL: sudo systemctl status postgresql"
        echo "  • Verify database: psql -h localhost -U $DB_USER -d $DB_NAME"
        echo "  • Regenerate Prisma: npm run prisma:generate"
        exit 1
    fi
}

# Run main function
main "$@"
