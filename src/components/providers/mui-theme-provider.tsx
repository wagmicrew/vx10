'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '@/lib/mui-theme'

// Import Roboto font
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

interface MUIThemeProviderProps {
  children: ReactNode
}

export function MUIThemeProvider({ children }: MUIThemeProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
