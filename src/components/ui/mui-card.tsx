"use client"

import {
  Paper,
  Card as MuiCard,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  CardActions as MuiCardActions,
  Typography,
  Box,
  PaperProps,
  CardProps,
  alpha,
} from '@mui/material'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EnhancedPaperProps extends PaperProps {
  variant?: 'glass' | 'solid' | 'outlined'
  children: ReactNode
}

interface EnhancedCardProps extends CardProps {
  variant?: 'glass' | 'solid' | 'outlined'
  children: ReactNode
}

interface EnhancedCardContentProps {
  children: ReactNode
  className?: string
}

interface EnhancedCardHeaderProps {
  title?: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
  children?: ReactNode
  className?: string
}

interface EnhancedCardActionsProps {
  children: ReactNode
  className?: string
}

// Enhanced Paper component with glassmorphism
export const EnhancedPaper = ({ 
  variant = 'glass', 
  children, 
  className,
  sx,
  ...props 
}: EnhancedPaperProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 3,
        }
      case 'outlined':
        return {
          background: 'transparent',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }
      case 'solid':
      default:
        return {
          background: 'background.paper',
          borderRadius: 3,
        }
    }
  }

  return (
    <Paper
      elevation={variant === 'glass' ? 0 : 2}
      sx={{
        ...getVariantStyles(),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: variant === 'glass' 
            ? '0 10px 30px rgba(0,0,0,0.1)' 
            : '0 8px 25px rgba(0,0,0,0.15)',
        },
        ...sx,
      }}
      className={className}
      {...props}
    >
      {children}
    </Paper>
  )
}

// Enhanced Card component with glassmorphism
export const EnhancedCard = ({ 
  variant = 'glass', 
  children, 
  className,
  sx,
  ...props 
}: EnhancedCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 3,
        }
      case 'outlined':
        return {
          background: 'transparent',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }
      case 'solid':
      default:
        return {
          background: 'background.paper',
          borderRadius: 3,
        }
    }
  }

  return (
    <MuiCard
      elevation={variant === 'glass' ? 0 : 2}
      sx={{
        ...getVariantStyles(),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: variant === 'glass' 
            ? '0 10px 30px rgba(0,0,0,0.1)' 
            : '0 8px 25px rgba(0,0,0,0.15)',
        },
        ...sx,
      }}
      className={className}
      {...props}
    >
      {children}
    </MuiCard>
  )
}

// Enhanced Card Content
export const EnhancedCardContent = ({ children, className }: EnhancedCardContentProps) => {
  return (
    <MuiCardContent className={cn("space-y-4", className)}>
      {children}
    </MuiCardContent>
  )
}

// Enhanced Card Header with icon support
export const EnhancedCardHeader = ({ 
  title, 
  subtitle, 
  icon, 
  action, 
  children, 
  className 
}: EnhancedCardHeaderProps) => {
  if (children) {
    return (
      <MuiCardHeader className={className}>
        {children}
      </MuiCardHeader>
    )
  }

  return (
    <MuiCardHeader
      avatar={icon}
      title={
        title && (
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {title}
          </Typography>
        )
      }
      subheader={
        subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        )
      }
      action={action}
      className={className}
    />
  )
}

// Enhanced Card Actions
export const EnhancedCardActions = ({ children, className }: EnhancedCardActionsProps) => {
  return (
    <MuiCardActions className={cn("justify-end", className)}>
      {children}
    </MuiCardActions>
  )
}
