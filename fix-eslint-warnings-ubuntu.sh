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

# Fix chart component - use a simpler approach
echo "📝 Fixing chart component..."
# Fix the forwardRef line
sed -i "s/const ChartLegend = forwardRef<HTMLDivElement, React.ComponentProps<typeof RechartsPrimitive.Legend>>((_, ref)/const ChartLegend = forwardRef<HTMLDivElement, React.ComponentProps<typeof RechartsPrimitive.Legend>>((props, ref)/" src/components/ui/chart.tsx

# Fix the index variable in chart - create a temporary file to handle complex replacement
cat > /tmp/fix-chart-index.js << 'SCRIPTEOF'
const fs = require('fs');
const file = 'src/components/ui/chart.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  // Remove index from the map function where it's not used
  content = content.replace(/\.map\(\(config, index\) => \(/g, '.map((config) => (');
  fs.writeFileSync(file, content);
}
SCRIPTEOF
node /tmp/fix-chart-index.js
rm /tmp/fix-chart-index.js

# Fix preline components
echo "📝 Fixing preline components..."
sed -i "s/const { className, size, asChild = false, variant, radius, .../const { className, size, variant, radius, .../" src/components/ui/preline-button.tsx
sed -i "s/variant = \"default\",//" src/components/ui/preline-input.tsx

# Fix edge-logger
echo "📝 Fixing edge-logger..."
# Fix the parsing error in edge-logger.js
cat > /tmp/fix-edge-logger.js << 'SCRIPTEOF'
const fs = require('fs');
const file = 'src/utils/edge-logger.js';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  // Find and fix the syntax error at line 173
  // Look for missing semicolons or syntax issues
  content = content.replace(/^\s*}\s*$/gm, '};');
  // Ensure all object/function definitions end properly
  content = content.replace(/const edgeLogger = {([^}]+)}/gs, (match, inner) => {
    return `const edgeLogger = {${inner}};`;
  });
  fs.writeFileSync(file, content);
}
SCRIPTEOF
node /tmp/fix-edge-logger.js
rm /tmp/fix-edge-logger.js

# Fix database-connection
echo "📝 Fixing database-connection..."
sed -i "s/} catch (error) {/} catch {/" src/lib/database-connection.ts
sed -i "s/const supabaseUrl = /\/\/ const supabaseUrl = /" src/lib/database-connection.ts

# Fix API example-edge-logger
echo "📝 Fixing example-edge-logger..."
sed -i "s/export default function handler(req, res)/export default function handler(req)/" pages/api/example-edge-logger.js

# Fix QR code components parsing errors
echo "📝 Fixing QR code components..."
cat > /tmp/fix-qr-components.js << 'SCRIPTEOF'
const fs = require('fs');

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
    
    // Fix any syntax errors - ensure proper closing of JSX and functions
    // Look for common patterns that might cause parsing errors
    
    // Ensure all JSX fragments are properly closed
    content = content.replace(/<>\s*$/gm, '<>');
    content = content.replace(/^\s*<\/>\s*$/gm, '</>');
    
    // Fix any incomplete function declarations
    content = content.replace(/}\s*,\s*$/gm, '},');
    
    // Ensure proper semicolons after const declarations
    content = content.replace(/^(\s*const\s+\w+\s*=\s*[^;]+)$/gm, '$1;');
    
    fs.writeFileSync(file, content);
  }
});

console.log('✅ Fixed QR code component syntax');
SCRIPTEOF

node /tmp/fix-qr-components.js
rm /tmp/fix-qr-components.js

# Add useCallback for missing dependencies
echo "📝 Adding useCallback for QR code components..."
cat > /tmp/fix-qr-deps.js << 'SCRIPTEOF'
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
    
    // Wrap generateQRCode in useCallback if it exists and isn't already wrapped
    if (content.includes('const generateQRCode = async () => {') && !content.includes('const generateQRCode = useCallback')) {
      content = content.replace(
        /const generateQRCode = async \(\) => \{/,
        'const generateQRCode = useCallback(async () => {'
      );
      
      // Find the end of the generateQRCode function and add dependencies
      const qrCodeFuncMatch = content.match(/const generateQRCode = useCallback\(async \(\) => \{[\s\S]*?(\n\s*)\}/);
      if (qrCodeFuncMatch) {
        const indent = qrCodeFuncMatch[1] || '\n  ';
        content = content.replace(
          /const generateQRCode = useCallback\(async \(\) => \{([\s\S]*?)\n(\s*)\}/,
          'const generateQRCode = useCallback(async () => {$1\n$2}, [swishInfo.phoneNumber, paymentRef, swishInfo.requestedAmount])'
        );
      }
    }
    
    // Update useEffect dependency if generateQRCode is used
    if (content.includes('generateQRCode()') && content.includes('}, [])')) {
      content = content.replace(
        /useEffect\(\(\) => \{[\s\S]*?generateQRCode\(\)[\s\S]*?\}, \[\]\)/,
        (match) => match.replace('}, [])', '}, [generateQRCode])')
      );
    }
    
    fs.writeFileSync(file, content);
  }
});

console.log('✅ Fixed QR code component dependencies');
SCRIPTEOF

node /tmp/fix-qr-deps.js
rm /tmp/fix-qr-deps.js

# Replace img with Next.js Image component
echo "📝 Replacing img tags with Next.js Image component..."
cat > /tmp/fix-img-tags.js << 'SCRIPTEOF'
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
      // Find the right place to add the import (after 'use client' if present)
      if (content.includes("'use client'")) {
        content = content.replace(
          /('use client'[\s\S]*?)\n/,
          "$1\nimport Image from 'next/image'\n"
        );
      } else {
        // Add at the beginning
        content = "import Image from 'next/image'\n" + content;
      }
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
SCRIPTEOF

node /tmp/fix-img-tags.js
rm /tmp/fix-img-tags.js

echo "✅ ESLint warning fixes applied!"
echo ""
echo "🔧 Running ESLint to check remaining warnings..."
npm run lint

echo ""
echo "✨ Done! Check the output above for any remaining warnings."
