# Convert line endings to Unix format
$content = Get-Content -Path "fix-eslint-warnings-complete.sh" -Raw
$unixContent = $content -replace "`r`n", "`n"
[System.IO.File]::WriteAllText("fix-eslint-warnings-complete.sh", $unixContent)

Write-Host "✅ Converted line endings to Unix format"

# Make the script executable (for Git)
git update-index --chmod=+x fix-eslint-warnings-complete.sh

# Stage and commit the changes
git add fix-eslint-warnings-complete.sh
git commit -m "Add comprehensive ESLint fixer script for Ubuntu

- Fixed edge-logger.js missing closing brace syntax error
- Fixed swish QR code components useCallback and dependencies
- Fixed chart component template literal syntax issue
- Handles all ESLint warnings and parsing errors
- Unix line endings for Ubuntu compatibility"

# Push to remote
git push origin master

Write-Host "✅ Pushed fixed ESLint script to repository"
