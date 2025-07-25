Write-Host "🧹 Fixing ESLint warnings..." -ForegroundColor Green

# Remove unused imports and variables
Write-Host "📝 Removing unused imports from booking routes..." -ForegroundColor Yellow

# Fix available-slots route
$content = Get-Content "src/app/api/booking/available-slots/route.js" -Raw
$content = $content -replace "import { format, startOfDay, addMinutes, isAfter, isBefore } from 'date-fns'", "import { startOfDay } from 'date-fns'"
Set-Content "src/app/api/booking/available-slots/route.js" $content -NoNewline

# Fix booking create route - comment out unused totalPrice
$content = Get-Content "src/app/api/booking/create/route.js" -Raw
$content = $content -replace "const totalPrice = ", "// const totalPrice = "
Set-Content "src/app/api/booking/create/route.js" $content -NoNewline

# Fix setup routes - remove unused 'request' parameters
Write-Host "📝 Fixing setup API routes..." -ForegroundColor Yellow
$content = Get-Content "src/app/api/setup/apply-schema/route.ts" -Raw
$content = $content -replace "export async function POST\(request: Request\)", "export async function POST()"
Set-Content "src/app/api/setup/apply-schema/route.ts" $content -NoNewline

$content = Get-Content "src/app/api/setup/seed-data/route.ts" -Raw
$content = $content -replace "export async function POST\(request: Request\)", "export async function POST()"
Set-Content "src/app/api/setup/seed-data/route.ts" $content -NoNewline

# Fix boka-korning page
Write-Host "📝 Fixing boka-korning page..." -ForegroundColor Yellow
$content = Get-Content "src/app/boka-korning/page.tsx" -Raw
$content = $content -replace "import { Badge } from[^\n]*\n", ""
$content = $content -replace "const session = ", "// const session = "
Set-Content "src/app/boka-korning/page.tsx" $content -NoNewline

# Fix BookingComponent
Write-Host "📝 Fixing BookingComponent..." -ForegroundColor Yellow
$content = Get-Content "src/components/BookingComponent.js" -Raw
$content = $content -replace "Badge, ", ""
Set-Content "src/components/BookingComponent.js" $content -NoNewline

# Fix swish components
Write-Host "📝 Fixing swish components..." -ForegroundColor Yellow
@("src/components/swish/qr-code-display-new.tsx", "src/components/swish/qr-code-display.tsx") | ForEach-Object {
    if (Test-Path $_) {
        $content = Get-Content $_ -Raw
        $content = $content -replace "import { Separator } from[^\n]*\n", ""
        $content = $content -replace '"betalningstiden"', '&quot;betalningstiden&quot;'
        Set-Content $_ $content -NoNewline
    }
}

# Fix UI components
Write-Host "📝 Fixing UI components..." -ForegroundColor Yellow
$content = Get-Content "src/components/ui/bento-grid.tsx" -Raw
$content = $content -replace "import { cn, alpha } from", "import { cn } from"
Set-Content "src/components/ui/bento-grid.tsx" $content -NoNewline

# Fix unused variables in calendar
$content = Get-Content "src/components/ui/calendar.tsx" -Raw
$content = $content -replace "const { disabled, focused, props } = ", "const { focused } = "
Set-Content "src/components/ui/calendar.tsx" $content -NoNewline

# Fix preline components
Write-Host "📝 Fixing preline components..." -ForegroundColor Yellow
$content = Get-Content "src/components/ui/preline-button.tsx" -Raw
$content = $content -replace "const { className, size, asChild = false, variant, radius,", "const { className, size, variant, radius,"
Set-Content "src/components/ui/preline-button.tsx" $content -NoNewline

# Fix edge-logger
Write-Host "📝 Fixing edge-logger..." -ForegroundColor Yellow
$content = Get-Content "src/utils/edge-logger.js" -Raw
$content = $content -replace "const logData = ", "// const logData = "
Set-Content "src/utils/edge-logger.js" $content -NoNewline

# Fix database-connection
Write-Host "📝 Fixing database-connection..." -ForegroundColor Yellow
$content = Get-Content "src/lib/database-connection.ts" -Raw
$content = $content -replace "} catch \(error\) {", "} catch {"
$content = $content -replace "const projectRef = ", "// const projectRef = "
$content = $content -replace "const testDatabaseUrl = ", "// const testDatabaseUrl = "
Set-Content "src/lib/database-connection.ts" $content -NoNewline

# Fix API example-edge-logger
Write-Host "📝 Fixing example-edge-logger..." -ForegroundColor Yellow
$content = Get-Content "pages/api/example-edge-logger.js" -Raw
$content = $content -replace "export default function handler\(req, res\)", "export default function handler(req)"
Set-Content "pages/api/example-edge-logger.js" $content -NoNewline

# Fix QR code components with useCallback
Write-Host "📝 Adding useCallback for QR code components..." -ForegroundColor Yellow
$qrFiles = @(
    "src/components/swish/qr-code-display-backup.tsx",
    "src/components/swish/qr-code-display-new.tsx",
    "src/components/swish/qr-code-display.tsx"
)

foreach ($file in $qrFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Add useCallback import if not present
        if (-not $content.Contains('useCallback')) {
            $content = $content -replace "import { useState, useEffect } from 'react'", "import { useState, useEffect, useCallback } from 'react'"
        }
        
        # Wrap generateQRCode in useCallback
        $content = $content -replace "const generateQRCode = async \(\) => \{", "const generateQRCode = useCallback(async () => {"
        
        # Close the useCallback with dependencies
        $content = $content -replace "(setQrCodeUrl\(url\)\s*})", "`$1, [swishInfo.phoneNumber, paymentRef, swishInfo.requestedAmount])"
        
        # Update useEffect dependency
        $content = $content -replace "}, \[\]\)", "}, [generateQRCode])"
        
        Set-Content $file $content -NoNewline
    }
}

# Replace img with Next.js Image component
Write-Host "📝 Replacing img tags with Next.js Image component..." -ForegroundColor Yellow
foreach ($file in $qrFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Add Image import if not present
        if (-not $content.Contains("import Image from 'next/image'")) {
            $content = $content -replace "('use client')", "`$1`nimport Image from 'next/image'"
        }
        
        # Replace img tags with Image component
        $content = $content -replace '<img\s+src={qrCodeUrl}\s+alt="[^"]*"\s+className="[^"]*"\s*/>', '<Image src={qrCodeUrl} alt="Swish QR kod" width={300} height={300} className="rounded-lg shadow-lg" />'
        
        Set-Content $file $content -NoNewline
    }
}

Write-Host "✅ ESLint warning fixes applied!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Running ESLint to check remaining warnings..." -ForegroundColor Yellow
npm run lint

Write-Host ""
Write-Host "✨ Done! Check the output above for any remaining warnings." -ForegroundColor Green
