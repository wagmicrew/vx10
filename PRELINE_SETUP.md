# Preline UI Integration with Tailwind 4

## Setup Complete ✅

Your project has been successfully integrated with **Preline UI** components built on **Tailwind CSS 4.0.0** with a **red and black theme**.

## 📦 Installed Packages

- `preline` - Main Preline UI package
- `@tailwindcss/forms` - Form styling plugin
- `@tailwindcss/postcss` - Tailwind 4 PostCSS plugin

## ⚙️ Configuration

### Tailwind 4 Configuration (`tailwind.config.css`)

```css
@import "tailwindcss";

/* Preline UI */
@source "./node_modules/preline/dist/*.js";
@import "./node_modules/preline/variants.css";

/* Plugins */
@plugin "@tailwindcss/forms";
```

### Theme Configuration

The theme is configured with red as primary color and includes:

- **Primary Colors**: Red spectrum (red-50 to red-950)
- **Gray Colors**: Full gray spectrum for text and backgrounds
- **Dark Mode**: Complete dark theme support
- **Custom Spacing**: Extended spacing utilities
- **Custom Fonts**: Inter as primary font

### PostCSS Configuration (`postcss.config.mjs`)

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

## 🎨 Available Components

### New Preline Components

#### 1. Button (`preline-button.tsx`)
```tsx
import { Button } from "@/components/ui/preline-button"

<Button variant="primary" size="default">Click me</Button>
```

**Variants:**
- `primary` - Red theme (default)
- `secondary` - Gray theme
- `outline` - Red outline
- `ghost` - Transparent with red hover
- `soft` - Light red background
- `white` - White background
- `tonal` - Red tonal
- `danger` - Red danger

**Sizes:** `sm`, `default`, `lg`, `xl`

#### 2. Card (`preline-card.tsx`)
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/preline-card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

**Variants:**
- `Card` - Standard card
- `InteractiveCard` - Hover effects
- `RedCard` - Red themed card

#### 3. Input (`preline-input.tsx`)
```tsx
import { Input, FloatingInput } from "@/components/ui/preline-input"

<Input label="Email" type="email" />
<FloatingInput label="Password" type="password" />
```

**Features:**
- Built-in label support
- Error state handling
- Helper text
- Floating label variant

#### 4. Badge (`preline-badge.tsx`)
```tsx
import { Badge, DotBadge } from "@/components/ui/preline-badge"

<Badge variant="primary">New</Badge>
<DotBadge variant="danger" />
```

**Variants:**
- `default`, `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `dark`
- `outline`, `outline-primary`

#### 5. Alert (`preline-alert.tsx`)
```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/preline-alert"

<Alert variant="primary" dismissible>
  <AlertTitle>Alert Title</AlertTitle>
  <AlertDescription>Alert message</AlertDescription>
</Alert>
```

## 🔧 Integration Status

### ✅ Migrated Components
- **Contact Form**: Now uses Preline Button
- **Main Navigation**: Updated with Preline styling classes
- **New Preline Components**: 5 core components created

### 🔄 Compatible Existing Components
The following shadcn/ui components work well with Preline and remain available:
- Accordion
- Avatar
- Checkbox
- Dropdown Menu
- Form
- Label
- Popover
- Select
- Separator
- Switch
- Table
- Tabs
- Textarea
- Tooltip

### 📂 Import Structure

```tsx
// Use Preline components
import { Button } from "@/components/ui/preline-button"
import { Card } from "@/components/ui/preline-card"
import { Input } from "@/components/ui/preline-input"

// Or import everything from the index
import { Button, Card, Input } from "@/components/ui/preline-index"

// Legacy shadcn components still work
import { Dialog } from "@/components/ui/dialog"
```

## 🎯 Red/Black Theme Usage

### Primary Colors (Red)
```css
bg-red-600        /* Primary button background */
text-red-800      /* Primary text */
border-red-200    /* Primary borders */
```

### Secondary Colors (Gray/Black)
```css
bg-gray-800       /* Dark backgrounds */
text-gray-600     /* Secondary text */
border-gray-200   /* Secondary borders */
```

### Dark Mode
All components automatically support dark mode with appropriate contrast ratios.

## 🚀 Usage Examples

### Red-themed Button Group
```tsx
<div className="flex gap-2">
  <Button variant="primary">Primary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
</div>
```

### Card with Red Accents
```tsx
<Card className="border-red-200">
  <CardHeader>
    <Badge variant="primary" className="w-fit">New</Badge>
    <CardTitle className="text-red-800">Red-themed Card</CardTitle>
  </CardHeader>
  <CardContent>
    <Input label="Email" variant="default" />
  </CardContent>
</Card>
```

### Form with Preline Components
```tsx
<form className="space-y-4">
  <Input label="Name" required />
  <FloatingInput label="Email" type="email" />
  <Button type="submit" variant="primary" className="w-full">
    Submit
  </Button>
</form>
```

## 📱 Responsive Design

All Preline components are fully responsive and include:
- Mobile-first design
- Touch-friendly interactions
- Proper spacing on all screen sizes
- Dark mode support

## 🔗 Documentation Links

- [Preline UI Docs](https://preline.co/docs/index.html)
- [Tailwind CSS 4 Docs](https://tailwindcss.com/)
- [Container Components](https://preline.co/docs/container.html)
- [Grid System](https://preline.co/docs/grid.html)
- [Card Components](https://preline.co/docs/card.html)

## ✨ Next Steps

1. **Gradually migrate components**: Replace existing UI components with Preline equivalents
2. **Customize theme**: Adjust red/black color palette in `tailwind.config.css`
3. **Add more components**: Create additional Preline components as needed
4. **Optimize bundle**: Remove unused shadcn components after migration

Your project now has a modern, consistent design system with Preline UI and Tailwind 4!
