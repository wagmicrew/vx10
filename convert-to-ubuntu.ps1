# Convert fix-dependencies.sh to Ubuntu format
# This script converts Windows line endings to Unix and makes it executable

Write-Host "Converting fix-dependencies.sh to Ubuntu format..." -ForegroundColor Green

# Read the content and convert line endings
$content = Get-Content -Path "fix-dependencies.sh" -Raw
$unixContent = $content -replace "`r`n", "`n"

# Write back with Unix line endings
[System.IO.File]::WriteAllText((Join-Path $PWD "fix-dependencies.sh"), $unixContent, [System.Text.Encoding]::UTF8)

Write-Host "Conversion complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Now on your Ubuntu server, run:" -ForegroundColor Yellow
Write-Host "chmod +x fix-dependencies.sh" -ForegroundColor Cyan
Write-Host "./fix-dependencies.sh" -ForegroundColor Cyan
