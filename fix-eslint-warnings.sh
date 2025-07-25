#!/bin/bash

echo "🧹 Fixing ESLint warnings..."

# Remove unused imports and variables
echo "📝 Removing unused imports from booking routes..."

# Fix available-slots route
sed -i "s/import { format, startOfDay, addMinutes, isAfter, isBefore } from 'date-fns'/import { startOfDay } from 'date-fns'/" src/app/api/booking/available-slots/route.js

# Fix booking create route - comment out unused totalPrice
sed -i "s/const totalPrice = /\/\/ const totalPrice = /" src/app/api/booking/create/route.js

# Fix setup routes - remove unused 'request' parameters
echo "📝 Fixing setup API routes..."
sed -i "s/export async function POST(request: Request)/export async function POST()/" src/app/api/setup/apply-schema/route.ts
sed -i "s/export async function POST(request: Request)/export async function POST()/" src/app/api/setup/seed-data/route.ts

# Fix boka-korning page
echo "📝 Fixing boka-korning page..."
sed -i "/import { Badge } from/d" src/app/boka-korning/page.tsx
sed -i "s/const session = /\/\/ const session = /" src/app/boka-korning/page.tsx

# Fix BookingComponent
echo "📝 Fixing BookingComponent..."
sed -i "s/Badge, //" src/components/BookingComponent.js

# Fix swish components
echo "📝 Fixing swish components..."
sed -i "/import { Separator } from/d" src/components/swish/qr-code-display-new.tsx
sed -i "/import { Separator } from/d" src/components/swish/qr-code-display.tsx

# Fix unescaped entities in swish components
sed -i 's/"betalningstiden"/\&quot;betalningstiden\&quot;/g' src/components/swish/qr-code-display-new.tsx
sed -i 's/"betalningstiden"/\&quot;betalningstiden\&quot;/g' src/components/swish/qr-code-display.tsx

# Fix UI components
echo "📝 Fixing UI components..."
sed -i "s/import { cn, alpha } from/import { cn } from/" src/components/ui/bento-grid.tsx

# Fix unused variables in calendar
sed -i "s/const { disabled, focused, props } = /const { focused } = /" src/components/ui/calendar.tsx

# Fix chart component
sed -i "s/const ChartLegend = forwardRef<HTMLDivElement, React.ComponentProps<typeof RechartsPrimitive.Legend>>((_, ref)/const ChartLegend = forwardRef<HTMLDivElement, React.ComponentProps<typeof RechartsPrimitive.Legend>>((props, ref)/" src/components/ui/chart.tsx
sed -i "/config.color ?? `hsl(var(--chart-\${index % 5 + 1}))`/s/index, //" src/components/ui/chart.tsx

# Fix preline components
echo "📝 Fixing preline components..."
sed -i "s/const { className, size, asChild = false, variant, radius, .../const { className, size, variant, radius, .../" src/components/ui/preline-button.tsx
sed -i "s/variant = \"default\",//" src/components/ui/preline-input.tsx

# Fix edge-logger
echo "📝 Fixing edge-logger..."
sed -i "s/const logData = /\/\/ const logData = /" src/utils/edge-logger.js

# Fix database-connection
echo "📝 Fixing database-connection..."
sed -i "s/} catch (error) {/} catch {/" src/lib/database-connection.ts
sed -i "s/const projectRef = /\/\/ const projectRef = /" src/lib/database-connection.ts
sed -i "s/const testDatabaseUrl = /\/\/ const testDatabaseUrl = /" src/lib/database-connection.ts

# Fix API example-edge-logger
echo "📝 Fixing example-edge-logger..."
sed -i "s/export default function handler(req, res)/export default function handler(req)/" pages/api/example-edge-logger.js

# Add useCallback for missing dependencies
echo "📝 Adding useCallback for QR code components..."
cat > fix-qr-deps.js << 'EOF'
const fs = require('fs');

// Fix QR code components
const files = [
  'src/components/swish/qr-code-display-backup.tsx',
  'src/components/swish/qr-code-display-new.tsx',
  'src/components/swish/qr-code-display.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add useCallback import if not present
    if (!content.includes('useCallback')) {
      content = content.replace(
        "import { useState, useEffect } from 'react'",
        "import { useState, useEffect, useCallback } from 'react'"
      );
    }
    
    // Wrap generateQRCode in useCallback
    content = content.replace(
      /const generateQRCode = async \(\) => \{/,
      'const generateQRCode = useCallback(async () => {'
    );
    
    // Close the useCallback
    content = content.replace(
      /setQrCodeUrl\(url\)\s*\}/,
      'setQrCodeUrl(url)\n  }, [swishInfo.phoneNumber, paymentRef, swishInfo.requestedAmount])'
    );
    
    // Update useEffect dependency
    content = content.replace(
      /}, \[\]\)/,
      '}, [generateQRCode])'
    );
    
    fs.writeFileSync(file, content);
  }
});

console.log('✅ Fixed QR code component dependencies');
EOF

node fix-qr-deps.js
rm fix-qr-deps.js

# Replace img with Next.js Image component
echo "📝 Replacing img tags with Next.js Image component..."
cat > fix-img-tags.js << 'EOF'
const fs = require('fs');

const files = [
  'src/components/swish/qr-code-display-backup.tsx',
  'src/components/swish/qr-code-display-new.tsx',
  'src/components/swish/qr-code-display.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add Image import if not present
    if (!content.includes("import Image from 'next/image'")) {
      content = content.replace(
        /^('use client'[\s\S]*?)$/m,
        "$1\nimport Image from 'next/image'"
      );
    }
    
    // Replace img tags with Image component
    content = content.replace(
      /<img\s+src={qrCodeUrl}\s+alt="[^"]*"\s+className="[^"]*"\s*\/>/g,
      '<Image src={qrCodeUrl} alt="Swish QR kod" width={300} height={300} className="rounded-lg shadow-lg" />'
    );
    
    fs.writeFileSync(file, content);
  }
});

console.log('✅ Replaced img tags with Next.js Image component');
EOF

node fix-img-tags.js
rm fix-img-tags.js

echo "✅ ESLint warning fixes applied!"
echo ""
echo "🔧 Running ESLint to check remaining warnings..."
npm run lint

echo ""
echo "✨ Done! Check the output above for any remaining warnings."
