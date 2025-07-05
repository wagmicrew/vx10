# UI Migration Guide: ShadCN to Material UI with MagicUI Enhancements

## Overview

This guide helps you migrate from ShadCN UI components to Material UI while preserving MagicUI enhancements like BorderBeam animations.

## Key Principles

1. **Material UI Core**: Use MUI components as the foundation
2. **MagicUI Enhancements**: Keep BorderBeam and other MagicUI animations
3. **Glassmorphism Design**: Maintain the glassmorphism styling
4. **Theme Consistency**: Use the custom red MUI theme
5. **TypeScript Safety**: Maintain strong typing

## Component Migration Map

### Buttons
```tsx
// OLD (ShadCN)
import { Button } from "@/components/ui/button"

// NEW (MUI Enhanced)
import { EnhancedButton } from "@/components/ui/mui-button"

// Usage
<EnhancedButton variant="glass" leftIcon={<Save />}>
  Save Changes
</EnhancedButton>
```

### Inputs
```tsx
// OLD (ShadCN)
import { Input } from "@/components/ui/input"

// NEW (MUI Enhanced)
import { EnhancedTextField, PasswordField } from "@/components/ui/mui-input"

// Usage
<EnhancedTextField
  variant="glass"
  label="Email"
  startIcon={<Mail className="h-4 w-4" />}
/>

<PasswordField
  variant="glass"
  label="Password"
  showPasswordToggle
/>
```

### Cards
```tsx
// OLD (ShadCN)
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// NEW (MUI Enhanced)
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from "@/components/ui/mui-card"

// Usage
<EnhancedCard variant="glass">
  <EnhancedCardHeader title="Dashboard" icon={<Dashboard />} />
  <EnhancedCardContent>
    Content here
  </EnhancedCardContent>
</EnhancedCard>
```

### Glassmorphism Popups
```tsx
// Keep the existing GlassmorphismPopup but use MUI components inside
import { GlassmorphismPopup } from "@/components/ui/glassmorphism-popup"
import { TextField, Button } from "@mui/material"

<GlassmorphismPopup
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Login"
  icon={<LogIn />}
>
  {/* MUI components with glass styling */}
  <TextField variant="outlined" sx={{ /* glass styles */ }} />
  <Button variant="contained" sx={{ /* glass styles */ }} />
</GlassmorphismPopup>
```

## MagicUI Integration

### BorderBeam on Modals
The `GlassmorphismPopup` already includes BorderBeam. For other components:

```tsx
import { BorderBeam } from "@/components/magicui/border-beam"

<div className="relative rounded-lg">
  <BorderBeam
    size={60}
    duration={12}
    colorFrom="#dc2626"
    colorTo="#ef4444"
  />
  {/* Your content */}
</div>
```

## Theme Usage

### Using Theme Colors
```tsx
// In sx prop
sx={{
  backgroundColor: 'primary.main', // #dc2626
  color: 'primary.contrastText',   // white
  '&:hover': {
    backgroundColor: 'primary.dark' // #b91c1c
  }
}}
```

### Glassmorphism Styles
```tsx
const glassStyles = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  }
}
```

## Migration Steps

### 1. Install Dependencies (Already Done)
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @fontsource/roboto
```

### 2. Wrap App with Theme Provider (Already Done)
```tsx
// src/app/layout.tsx
import { MUIThemeProvider } from '@/components/providers/mui-theme-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MUIThemeProvider>
          {children}
        </MUIThemeProvider>
      </body>
    </html>
  )
}
```

### 3. Migrate Components Gradually

#### Priority Order:
1. **Login Modal** (Done) - `src/components/auth/mui-login-modal.tsx`
2. **Buttons** - Replace Button imports
3. **Inputs** - Replace Input/TextField imports  
4. **Cards** - Replace Card imports
5. **Navigation** - Update navigation components
6. **Forms** - Migrate form components

### 4. Update Imports

Create a barrel export for easy imports:

```tsx
// src/components/ui/index.ts
export * from './mui-button'
export * from './mui-input' 
export * from './mui-card'
export * from './glassmorphism-popup'
```

## Example: Complete Form Migration

### Before (ShadCN)
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function UserForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Name" />
        <Input type="email" placeholder="Email" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  )
}
```

### After (MUI Enhanced)
```tsx
import { EnhancedButton } from "@/components/ui/mui-button"
import { EnhancedTextField } from "@/components/ui/mui-input"
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader } from "@/components/ui/mui-card"
import { Box } from "@mui/material"
import { User, Mail } from "lucide-react"

export function UserForm() {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader 
        title="User Information" 
        icon={<User className="h-5 w-5" />} 
      />
      <EnhancedCardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <EnhancedTextField
            variant="glass"
            label="Name"
            startIcon={<User className="h-4 w-4" />}
          />
          <EnhancedTextField
            variant="glass"
            type="email"
            label="Email"
            startIcon={<Mail className="h-4 w-4" />}
          />
          <EnhancedButton variant="solid" fullWidth>
            Submit
          </EnhancedButton>
        </Box>
      </EnhancedCardContent>
    </EnhancedCard>
  )
}
```

## Best Practices

### 1. Consistent Variants
- Use `variant="glass"` for glassmorphism effects
- Use `variant="solid"` for primary actions
- Use `variant="outlined"` for secondary actions

### 2. Icon Usage
- Always use Lucide React icons for consistency
- Place icons in `startIcon` or `endIcon` props
- Use consistent icon sizes (`h-4 w-4` for inputs, `h-5 w-5` for headers)

### 3. Spacing and Layout
- Use MUI's `Box` component for layout
- Use theme spacing values: `sx={{ p: 2, m: 1 }}`
- Use `gap` property for flex layouts

### 4. Color Usage
- Use theme colors: `primary.main`, `secondary.main`
- Use rgba values for glass effects
- Maintain contrast ratios for accessibility

## Common Patterns

### Modal with BorderBeam
```tsx
<GlassmorphismPopup
  isOpen={isOpen}
  onClose={onClose}
  title="Settings"
  icon={<Settings />}
>
  <Box sx={{ p: 2 }}>
    <EnhancedTextField variant="glass" label="Setting Name" />
    <EnhancedButton variant="solid" fullWidth>
      Save Settings
    </EnhancedButton>
  </Box>
</GlassmorphismPopup>
```

### Card with Actions
```tsx
<EnhancedCard variant="glass">
  <EnhancedCardHeader 
    title="Project Details" 
    action={
      <EnhancedIconButton variant="glass">
        <MoreVert />
      </EnhancedIconButton>
    }
  />
  <EnhancedCardContent>
    Content here
  </EnhancedCardContent>
  <EnhancedCardActions>
    <EnhancedButton variant="outlined">Cancel</EnhancedButton>
    <EnhancedButton variant="solid">Save</EnhancedButton>
  </EnhancedCardActions>
</EnhancedCard>
```

## Testing the Migration

1. Start with the login modal: `src/components/auth/mui-login-modal.tsx`
2. Test all variants: `glass`, `solid`, `outlined`
3. Verify BorderBeam animation works
4. Check theme colors and hover effects
5. Test responsive behavior

## Next Steps

1. Run the development server to test the new login modal
2. Gradually migrate other components starting with buttons
3. Update existing pages to use new components
4. Test thoroughly for visual and functional consistency
5. Document any custom styling needs
