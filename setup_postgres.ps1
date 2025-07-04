# PowerShell script to setup PostgreSQL for VX10 project
param(
    [switch]$Force,
    [switch]$Reset
)

Write-Host "🚀 VX10 PostgreSQL Setup Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Function to check if PostgreSQL is installed
function Test-PostgreSQLInstalled {
    try {
        $pgVersion = Get-Command psql -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# Function to install PostgreSQL using Chocolatey
function Install-PostgreSQL {
    Write-Host "📦 Installing PostgreSQL..." -ForegroundColor Yellow
    
    # Check if Chocolatey is installed
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Chocolatey is not installed. Please install Chocolatey first or install PostgreSQL manually." -ForegroundColor Red
        Write-Host "Visit: https://chocolatey.org/install" -ForegroundColor Blue
        return $false
    }
    
    try {
        # Install PostgreSQL
        choco install postgresql --yes
        
        # Add PostgreSQL bin to PATH for current session
        $env:PATH += ";C:\Program Files\PostgreSQL\16\bin"
        
        Write-Host "✅ PostgreSQL installed successfully!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Failed to install PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to setup database and user
function Setup-Database {
    Write-Host "🔧 Setting up database and user..." -ForegroundColor Yellow
    
    try {
        # Create user and database
        $createUserCmd = "CREATE USER vx10user WITH PASSWORD 'vx10password';"
        $createDbCmd = "CREATE DATABASE vx10_db OWNER vx10user;"
        $grantCmd = "GRANT ALL PRIVILEGES ON DATABASE vx10_db TO vx10user;"
        
        # Execute commands as postgres user
        psql -U postgres -c $createUserCmd 2>$null
        psql -U postgres -c $createDbCmd 2>$null
        psql -U postgres -c $grantCmd 2>$null
        
        Write-Host "✅ Database and user created successfully!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "⚠️  Database setup encountered issues (may already exist): $($_.Exception.Message)" -ForegroundColor Yellow
        return $true # Continue anyway as it might already exist
    }
}

# Function to create test users
function Create-TestUsers {
    Write-Host "👥 Creating test users..." -ForegroundColor Yellow
    
    # Hash passwords using Node.js bcrypt
    $hashScript = @"
const bcrypt = require('bcryptjs');
const passwords = ['admin', 'teacher', 'student'];
passwords.forEach(async (pwd) => {
    const hash = await bcrypt.hash(pwd, 12);
    console.log(`${pwd}:${hash}`);
});
"@
    
    try {
        # Create temporary script file
        $tempScript = "temp_hash.js"
        $hashScript | Out-File -FilePath $tempScript -Encoding UTF8
        
        # Run the script and capture output
        $hashedPasswords = node $tempScript
        
        # Parse the hashed passwords
        $adminHash = ($hashedPasswords | Where-Object { $_ -like "admin:*" }).Split(':')[1]
        $teacherHash = ($hashedPasswords | Where-Object { $_ -like "teacher:*" }).Split(':')[1]
        $studentHash = ($hashedPasswords | Where-Object { $_ -like "student:*" }).Split(':')[1]
        
        # Clean up temp file
        Remove-Item $tempScript -Force
        
        # SQL to insert test users
        $insertUsers = @"
INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") VALUES
('admin-id-001', 'Admin User', 'admin@vx10.com', '$adminHash', 'ADMIN', NOW(), NOW()),
('teacher-id-001', 'Teacher User', 'teacher@vx10.com', '$teacherHash', 'TEACHER', NOW(), NOW()),
('student-id-001', 'Student User', 'student@vx10.com', '$studentHash', 'STUDENT', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
    password = EXCLUDED.password,
    "updatedAt" = NOW();
"@
        
        # Execute the SQL
        $insertUsers | psql -U vx10user -d vx10_db
        
        Write-Host "✅ Test users created successfully!" -ForegroundColor Green
        Write-Host "   Admin: admin@vx10.com / admin" -ForegroundColor Blue
        Write-Host "   Teacher: teacher@vx10.com / teacher" -ForegroundColor Blue
        Write-Host "   Student: student@vx10.com / student" -ForegroundColor Blue
        
        return $true
    }
    catch {
        Write-Host "❌ Failed to create test users: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
try {
    # Check if PostgreSQL is installed
    if (-not (Test-PostgreSQLInstalled) -or $Force) {
        if (-not (Install-PostgreSQL)) {
            Write-Host "❌ Failed to install PostgreSQL. Exiting." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "✅ PostgreSQL is already installed!" -ForegroundColor Green
    }
    
    # Setup database
    if (-not (Setup-Database)) {
        Write-Host "❌ Failed to setup database. Exiting." -ForegroundColor Red
        exit 1
    }
    
    # Run Prisma migrations
    Write-Host "🔄 Running Prisma migrations..." -ForegroundColor Yellow
    npm run prisma:migrate
    
    # Generate Prisma client
    Write-Host "🔄 Generating Prisma client..." -ForegroundColor Yellow
    npm run prisma:generate
    
    # Create test users
    Create-TestUsers
    
    Write-Host ""
    Write-Host "🎉 PostgreSQL setup completed successfully!" -ForegroundColor Green
    Write-Host "Database URL: postgresql://vx10user:vx10password@localhost:5432/vx10_db" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Test accounts created:" -ForegroundColor Yellow
    Write-Host "  Admin: admin@vx10.com / admin" -ForegroundColor Blue
    Write-Host "  Teacher: teacher@vx10.com / teacher" -ForegroundColor Blue
    Write-Host "  Student: student@vx10.com / student" -ForegroundColor Blue
    
} catch {
    Write-Host "❌ Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
