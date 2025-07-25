#!/bin/bash

echo "🧹 Removing logger functionality from the application..."
echo ""

# Function to remove logger imports and convert to console
fix_file_logger() {
    local file=$1
    echo "  Fixing: $file"
    
    # Create a temporary file
    local temp_file="${file}.tmp"
    
    # Process the file
    if grep -q "import.*edge-logger" "$file"; then
        # Remove logger import line
        sed '/import.*edge-logger/d' "$file" > "$temp_file"
        
        # Replace logger calls with console calls
        sed -i 's/logger\.error(/console.error(/g' "$temp_file"
        sed -i 's/logger\.warn(/console.warn(/g' "$temp_file"
        sed -i 's/logger\.info(/console.log(/g' "$temp_file"
        sed -i 's/logger\.debug(/console.debug(/g' "$temp_file"
        sed -i 's/logger\.success(/console.log(/g' "$temp_file"
        
        # Replace logger API logging methods
        sed -i 's/logger\.logApiRequest([^)]*)/\/\/ API request logging removed/g' "$temp_file"
        sed -i 's/logger\.logApiResponse([^)]*)/\/\/ API response logging removed/g' "$temp_file"
        sed -i 's/logger\.handleError(/console.error(/g' "$temp_file"
        
        # Move temp file back
        mv "$temp_file" "$file"
    fi
}

# Remove edge-logger file
echo "1. Removing edge-logger.js file..."
rm -f ./src/utils/edge-logger.js
rm -f ./utils/edge-logger.js

# Remove example edge logger API route
echo "2. Removing example-edge-logger.js file..."
rm -f ./pages/api/example-edge-logger.js

# Fix all files that import edge-logger
echo "3. Fixing files that use the logger..."

# API Routes
fix_file_logger "./src/app/api/booking/available-slots/route.js"
fix_file_logger "./src/app/api/admin/settings/route.js"
fix_file_logger "./src/app/api/lessons/route.js"
fix_file_logger "./src/app/api/booking/create/route.js"

# TypeScript API route - special handling
echo "  Fixing: ./src/app/api/errors/route.ts"
if [ -f "./src/app/api/errors/route.ts" ]; then
    # Remove logger import
    sed -i '/import.*edge-logger/d' ./src/app/api/errors/route.ts
    
    # Replace logger calls
    sed -i 's/logger\.error(/console.error(/g' ./src/app/api/errors/route.ts
    sed -i 's/logger\.info(/console.log(/g' ./src/app/api/errors/route.ts
    sed -i 's/logger\.warn(/console.warn(/g' ./src/app/api/errors/route.ts
    sed -i 's/logger\.debug(/console.debug(/g' ./src/app/api/errors/route.ts
fi

# Search for any remaining logger references
echo ""
echo "4. Searching for any remaining logger references..."

# Create a list of files to check
remaining_files=$(grep -r "edge-logger\|EdgeCompatibleLogger" ./src ./pages ./app 2>/dev/null | grep -v node_modules | cut -d: -f1 | sort -u)

if [ -n "$remaining_files" ]; then
    echo "  Found remaining references in:"
    for file in $remaining_files; do
        echo "    - $file"
        fix_file_logger "$file"
    done
else
    echo "  ✅ No remaining logger references found"
fi

# Clean up any logger-related configuration
echo ""
echo "5. Cleaning up logger-related configurations..."

# Remove logger from next.config if present
if [ -f "next.config.js" ] && grep -q "edge-logger" next.config.js; then
    echo "  Cleaning next.config.js..."
    sed -i '/edge-logger/d' next.config.js
fi

if [ -f "next.config.mjs" ] && grep -q "edge-logger" next.config.mjs; then
    echo "  Cleaning next.config.mjs..."
    sed -i '/edge-logger/d' next.config.mjs
fi

# Final verification
echo ""
echo "6. Final verification..."
echo ""

# Count remaining references
remaining_count=$(grep -r "edge-logger\|EdgeCompatibleLogger\|logger\." ./src ./pages ./app 2>/dev/null | grep -v node_modules | grep -v "console\." | wc -l)

if [ "$remaining_count" -eq 0 ]; then
    echo "✅ Successfully removed all logger functionality!"
    echo ""
    echo "The following changes were made:"
    echo "  - Removed edge-logger.js file"
    echo "  - Removed example-edge-logger.js file"
    echo "  - Replaced all logger calls with console methods"
    echo "  - Removed all logger imports"
else
    echo "⚠️  Found $remaining_count potential remaining references. Please check manually:"
    grep -r "edge-logger\|EdgeCompatibleLogger\|logger\." ./src ./pages ./app 2>/dev/null | grep -v node_modules | grep -v "console\."
fi

echo ""
echo "📋 Next steps:"
echo "1. Run 'npm run build' to verify the build works"
echo "2. Test the application to ensure logging still works via console"
echo "3. Commit the changes: git add -A && git commit -m 'Remove logger functionality'"
echo ""
