# Ubuntu Installation Guide

If the `fix-dependencies.sh` script has line ending issues, follow these manual steps:

## Quick Manual Fix (Ubuntu)

```bash
# 1. Pull latest changes
git pull origin master

# 2. Fix line endings if needed
sed -i 's/\r$//' fix-dependencies.sh

# 3. Make executable
chmod +x fix-dependencies.sh

# 4. Run the script
./fix-dependencies.sh
```

## Alternative: Manual Installation

If the script still doesn't work, run these commands manually:

```bash
# Clean and install dependencies
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install

# Fix NextAuth import
sed -i 's/import { getServerSession } from '\''next-auth'\'';/import { auth } from "@\/lib\/auth\/config";/' src/app/api/booking/create/route.js
sed -i 's/const session = await getServerSession();/const session = await auth();/' src/app/api/booking/create/route.js

# Add NextAuth v5 export if not exists
if ! grep -q "export.*auth" src/lib/auth/config.ts; then
    echo "" >> src/lib/auth/config.ts
    echo "// NextAuth v5 export" >> src/lib/auth/config.ts
    echo 'export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);' >> src/lib/auth/config.ts
fi

# Replace edge logger with safe version
if [[ -f "utils/edge-logger-safe.js" ]]; then
    cp utils/edge-logger.js utils/node-logger-backup.js
    cp utils/edge-logger-safe.js utils/edge-logger.js
fi

# Generate Prisma client and fix imports
if [[ -f "prisma/schema.prisma" ]]; then
    npx prisma generate
    
    # Fix Prisma import paths in API routes
    find src/app/api -name "*.js" -exec sed -i 's|from '\''@prisma/client'\''|from '\''../../../generated/prisma'\''|g' {} \;
    find src/app/api -name "*.js" -exec sed -i 's|from "@prisma/client"|from "../../../generated/prisma"|g' {} \;
    
    # Fix specific path for lessons route (different depth)
    if [[ -f "src/app/api/lessons/route.js" ]]; then
        sed -i 's|from '\''../../../generated/prisma'\''|from '\''../../generated/prisma'\''|g' src/app/api/lessons/route.js
    fi
fi

# Test build
npm run build
```

## Expected Results

After running either the script or manual commands:
- ✅ No more `getServerSession` import errors
- ✅ No more Edge Runtime Node.js API warnings  
- ✅ Prisma client properly generated
- ✅ Build completes successfully
