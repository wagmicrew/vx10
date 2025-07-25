# Ubuntu Fixes for VX10 Project

## Summary of Issues Fixed

This document outlines the fixes implemented in the `fix-dependencies.sh` script for Ubuntu compatibility and the specific build issues you encountered.

## Issues Addressed

### 1. NextAuth v5 getServerSession Import Error

**Problem:** 
```
Attempted import error: 'getServerSession' is not exported from 'next-auth'
```

**Solution:**
- Updated `src/app/api/booking/create/route.js` to use the new NextAuth v5 API
- Changed from `import { getServerSession } from 'next-auth'` to `import { auth } from "@/lib/auth/config"`
- Updated function call from `await getServerSession()` to `await auth()`
- Added NextAuth v5 export to `src/lib/auth/config.ts`

### 2. Edge Runtime Node.js API Warnings

**Problem:**
```
A Node.js API is used (process.versions, process.cwd, process.pid, etc.) which is not supported in the Edge Runtime
```

**Solution:**
- Created an edge-safe logger that detects runtime environment
- Replaced Node.js-specific APIs with edge-compatible alternatives
- Backup original logger as `utils/node-logger-backup.js`
- New logger works in both Edge and Node.js environments

### 3. Prisma Client Generation Error

**Problem:**
```
@prisma/client did not initialize yet. Please run "prisma generate"
```

**Solution:**
- Script automatically runs `npx prisma generate` if `prisma/schema.prisma` exists
- Ensures Prisma client is properly initialized before build

## Files Modified

### 1. `/src/app/api/booking/create/route.js`
- ✅ Fixed import: `import { auth } from "@/lib/auth/config"`
- ✅ Fixed function call: `const session = await auth()`

### 2. `/src/lib/auth/config.ts`
- ✅ Added NextAuth v5 export: `export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);`

### 3. `/utils/edge-logger.js`
- ✅ Replaced with edge-safe version
- ✅ Backup created as `utils/node-logger-backup.js`

## Script Features

The enhanced `fix-dependencies.sh` script now includes:

1. **Dependency Management**
   - Clean installation of all packages
   - Verification of critical packages
   - npm cache cleaning

2. **NextAuth v5 Fixes**
   - Automatic import replacement
   - Auth export generation

3. **Edge Runtime Compatibility**
   - Logger replacement with edge-safe version
   - Node.js API removal

4. **Prisma Integration**
   - Automatic client generation
   - Schema detection

5. **Build Testing**
   - Automatic build verification
   - Detailed error reporting

## Usage on Ubuntu

1. Make the script executable:
   ```bash
   chmod +x fix-dependencies.sh
   ```

2. Run the script:
   ```bash
   ./fix-dependencies.sh
   ```

3. The script will:
   - Ask for confirmation before proceeding
   - Clean and reinstall dependencies
   - Apply all necessary fixes
   - Test the build
   - Report success or provide troubleshooting tips

## Expected Results After Running

✅ No more `getServerSession` import errors  
✅ No more Edge Runtime Node.js API warnings  
✅ Prisma client properly generated  
✅ Build completes successfully  
✅ Only minor ESLint warnings remain (non-blocking)  

## Manual Verification

After running the script, you can verify the fixes:

```bash
# Check if NextAuth import is fixed
grep -n "import.*auth" src/app/api/booking/create/route.js

# Check if Prisma client exists
ls -la node_modules/.prisma/client/

# Test build
npm run build
```

## Troubleshooting

If you still encounter issues after running the script:

1. **Node.js Version**: Ensure you're using Node.js 18+ for Next.js 15
2. **Environment Variables**: Check your `.env.local` file
3. **Cache Issues**: Try `rm -rf .next && npm run build`
4. **TypeScript**: Run `npx tsc --noEmit` to check for type errors

## Notes

- The script preserves your original logger as `utils/node-logger-backup.js`
- All changes are automatically applied
- The build warnings about unused variables are non-blocking
- Database connection errors during prerendering are expected and don't affect the build
