Write-Host "🧹 Removing logger functionality from the application..." -ForegroundColor Green
Write-Host ""

# Function to fix logger references in a file
function Fix-FileLogger {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "  Fixing: $FilePath" -ForegroundColor Yellow
        
        $content = Get-Content $FilePath -Raw
        $modified = $false
        
        # Check if file contains logger import
        if ($content -match "import.*edge-logger") {
            # Remove logger import
            $content = $content -replace "import.*edge-logger.*\r?\n", ""
            
            # Replace logger calls with console calls
            $content = $content -replace "logger\.error\(", "console.error("
            $content = $content -replace "logger\.warn\(", "console.warn("
            $content = $content -replace "logger\.info\(", "console.log("
            $content = $content -replace "logger\.debug\(", "console.debug("
            $content = $content -replace "logger\.success\(", "console.log("
            
            # Replace logger API methods
            $content = $content -replace "logger\.logApiRequest\([^)]*\)", "// API request logging removed"
            $content = $content -replace "logger\.logApiResponse\([^)]*\)", "// API response logging removed"
            $content = $content -replace "logger\.handleError\(", "console.error("
            
            $modified = $true
        }
        
        if ($modified) {
            Set-Content $FilePath $content -NoNewline
            Write-Host "    ✓ Fixed" -ForegroundColor Green
        }
    }
}

# 1. Remove edge-logger files
Write-Host "1. Removing edge-logger.js file..." -ForegroundColor Cyan
Remove-Item -Path "./src/utils/edge-logger.js" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "./utils/edge-logger.js" -Force -ErrorAction SilentlyContinue

# 2. Remove example edge logger
Write-Host "2. Removing example-edge-logger.js file..." -ForegroundColor Cyan
Remove-Item -Path "./pages/api/example-edge-logger.js" -Force -ErrorAction SilentlyContinue

# 3. Fix files that use logger
Write-Host "3. Fixing files that use the logger..." -ForegroundColor Cyan

# Fix API routes
Fix-FileLogger "./src/app/api/booking/available-slots/route.js"
Fix-FileLogger "./src/app/api/admin/settings/route.js"
Fix-FileLogger "./src/app/api/lessons/route.js"
Fix-FileLogger "./src/app/api/booking/create/route.js"
Fix-FileLogger "./src/app/api/errors/route.ts"

# 4. Search for remaining references
Write-Host ""
Write-Host "4. Searching for any remaining logger references..." -ForegroundColor Cyan

$remainingFiles = @()
Get-ChildItem -Path "./src", "./pages", "./app" -Recurse -Include "*.js", "*.jsx", "*.ts", "*.tsx" -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "edge-logger|EdgeCompatibleLogger") {
        $remainingFiles += $_.FullName
    }
}

if ($remainingFiles.Count -gt 0) {
    Write-Host "  Found remaining references in:" -ForegroundColor Yellow
    foreach ($file in $remainingFiles) {
        Write-Host "    - $file"
        Fix-FileLogger $file
    }
} else {
    Write-Host "  ✅ No remaining logger references found" -ForegroundColor Green
}

# 5. Clean up configurations
Write-Host ""
Write-Host "5. Cleaning up logger-related configurations..." -ForegroundColor Cyan

if (Test-Path "next.config.js") {
    $config = Get-Content "next.config.js" -Raw
    if ($config -match "edge-logger") {
        $config = $config -replace ".*edge-logger.*\r?\n", ""
        Set-Content "next.config.js" $config -NoNewline
        Write-Host "  Cleaned next.config.js" -ForegroundColor Green
    }
}

if (Test-Path "next.config.mjs") {
    $config = Get-Content "next.config.mjs" -Raw
    if ($config -match "edge-logger") {
        $config = $config -replace ".*edge-logger.*\r?\n", ""
        Set-Content "next.config.mjs" $config -NoNewline
        Write-Host "  Cleaned next.config.mjs" -ForegroundColor Green
    }
}

# 6. Final verification
Write-Host ""
Write-Host "6. Final verification..." -ForegroundColor Cyan
Write-Host ""

# Check for any remaining references
$finalCheck = @()
Get-ChildItem -Path "./src", "./pages", "./app" -Recurse -Include "*.js", "*.jsx", "*.ts", "*.tsx" -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "edge-logger|EdgeCompatibleLogger|logger\." -and $content -notmatch "console\.") {
        $finalCheck += $_.FullName
    }
}

if ($finalCheck.Count -eq 0) {
    Write-Host "✅ Successfully removed all logger functionality!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The following changes were made:" -ForegroundColor Yellow
    Write-Host "  - Removed edge-logger.js file"
    Write-Host "  - Removed example-edge-logger.js file"
    Write-Host "  - Replaced all logger calls with console methods"
    Write-Host "  - Removed all logger imports"
} else {
    Write-Host "⚠️  Found $($finalCheck.Count) potential remaining references:" -ForegroundColor Yellow
    foreach ($file in $finalCheck) {
        Write-Host "  - $file"
    }
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'npm run build' to verify the build works"
Write-Host "2. Test the application to ensure logging still works via console"
Write-Host "3. Commit the changes: git add -A; git commit -m 'Remove logger functionality'"
Write-Host ""
