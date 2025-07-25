# Fix Remaining ESLint Warnings on Ubuntu

## Quick Start

1. **Pull latest changes**:
   ```bash
   git pull
   ```

2. **Make the script executable**:
   ```bash
   chmod +x fix-remaining-eslint.sh
   ```

3. **Run the fix script**:
   ```bash
   ./fix-remaining-eslint.sh
   ```

## What the Script Fixes

### ✅ Unused Variables and Imports
- Removes unused imports from `date-fns` in the available-slots route
- Removes unused `totalPrice` variable in booking create route
- Removes unused `request` parameters in TypeScript API routes
- Removes unused `session` variable in boka-korning page
- Fixes unused imports and variables in UI components

### ✅ React Hook Dependencies
- Fixes the `generateQRCode` function in swish QR code components by wrapping it in `useCallback`
- Properly manages hook dependencies to avoid ESLint warnings

### ✅ Parsing Errors
- Fixes parsing errors in swish QR code components
- Fixes edge-logger.js parsing error by removing unused variable

### ⚠️ Warnings That Remain (Intentional)
Some warnings about `any` types are intentional for flexibility:
- Chart component uses `any` for Recharts compatibility
- Auth config uses `any` for NextAuth type flexibility
- These can be suppressed with ESLint rule overrides if needed

## Manual Verification

After running the script, verify the fixes:

```bash
npm run lint
```

## Expected Output

You should see significantly fewer warnings, mainly about:
- Some `@typescript-eslint/no-explicit-any` warnings (intentional)
- Possibly some React hook exhaustive deps warnings (handled with eslint-disable comments)

## Troubleshooting

If you still see errors:

1. **Parsing errors**: Check if the file was properly saved with correct syntax
2. **Hook dependencies**: The script adds `useCallback` to handle these
3. **TypeScript errors**: Some `any` types are needed for third-party library compatibility

## Additional Notes

- The script creates an `.eslintrc.local.json` file for specific rule overrides
- All fixes maintain the functionality of your code
- The script is idempotent - safe to run multiple times
