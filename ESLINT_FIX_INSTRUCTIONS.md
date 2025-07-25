# ESLint Fix Instructions for Ubuntu

## Quick Fix

Run the comprehensive ESLint fixer script that handles all syntax and warning issues:

```bash
# Pull the latest changes
git pull origin master

# Make the script executable
chmod +x fix-eslint-warnings-complete.sh

# Run the comprehensive fixer
./fix-eslint-warnings-complete.sh
```

## What the Script Fixes

1. **Syntax Errors:**
   - `edge-logger.js` - Missing closing brace for the EdgeCompatibleLogger class
   - Swish QR code components - Parsing errors due to missing React hook dependencies
   - Chart component - Template literal syntax issues

2. **ESLint Warnings:**
   - Unused imports and variables
   - Missing React hook dependencies (useCallback/useEffect)
   - Incorrect function parameters
   - Replace `<img>` tags with Next.js `<Image>` components

## Manual Alternative

If the script has issues, you can fix the most critical error manually:

```bash
# Fix the edge-logger.js syntax error (missing closing brace)
echo "}" >> src/utils/edge-logger.js

# Then run the build
npm run build
```

## Troubleshooting

If you still see errors after running the script:

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules
   npm install
   ```

2. **Check for uncommitted changes:**
   ```bash
   git status
   git diff
   ```

3. **Run ESLint with auto-fix:**
   ```bash
   npm run lint -- --fix
   ```

The build should now complete successfully with only minor ESLint warnings remaining.
