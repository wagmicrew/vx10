"use client"

import { forwardRef } from "react"
import { 
  Button, 
  ButtonProps, 
  IconButton, 
  IconButtonProps, 
  Fab, 
  FabProps,
  CircularProgress,
  ButtonGroup,
  ButtonGroupProps
} from "@mui/material"
import { cn } from "@/lib/utils"

// Enhanced Button with glassmorphism styling
interface EnhancedButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'glass' | 'solid' | 'outlined' | 'text' | 'contained'
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    variant = 'contained', 
    isLoading = false, 
    loadingText,
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    className, 
    sx,
    ...props 
  }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(255, 255, 255, 0.1)',
            },
            '&:disabled': {
              backgroundColor: 'rgba(107, 114, 128, 0.5)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          }
        case 'solid':
          return {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.25)',
            },
          }
        default:
          return {}
      }
    }

    const muiVariant = variant === 'glass' || variant === 'solid' ? 'contained' : variant

    return (
      <Button
        ref={ref}
        variant={muiVariant}
        disabled={disabled || isLoading}
        className={cn(className)}
        sx={{
          ...getVariantStyles(),
          transition: 'all 0.2s ease',
          ...sx,
        }}
        startIcon={isLoading ? <CircularProgress size={16} /> : leftIcon}
        endIcon={rightIcon}
        {...props}
      >
        {isLoading ? (loadingText || 'Loading...') : children}
      </Button>
    )
  }
)

EnhancedButton.displayName = "EnhancedButton"

// Enhanced Icon Button with glassmorphism styling
interface EnhancedIconButtonProps extends Omit<IconButtonProps, 'variant'> {
  variant?: 'glass' | 'solid' | 'outlined' | 'standard'
  isLoading?: boolean
}

export const EnhancedIconButton = forwardRef<HTMLButtonElement, EnhancedIconButtonProps>(
  ({ variant = 'standard', isLoading = false, children, className, sx, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'scale(1.05)',
            },
          }
        case 'solid':
          return {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.05)',
            },
          }
        case 'outlined':
          return {
            border: '2px solid',
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              transform: 'scale(1.05)',
            },
          }
        default:
          return {}
      }
    }

    return (
      <IconButton
        ref={ref}
        disabled={isLoading}
        className={cn(className)}
        sx={{
          ...getVariantStyles(),
          transition: 'all 0.2s ease',
          ...sx,
        }}
        {...props}
      >
        {isLoading ? <CircularProgress size={20} /> : children}
      </IconButton>
    )
  }
)

EnhancedIconButton.displayName = "EnhancedIconButton"

// Enhanced Floating Action Button
interface EnhancedFabProps extends Omit<FabProps, 'variant'> {
  variant?: 'glass' | 'solid' | 'extended'
  isLoading?: boolean
}

export const EnhancedFab = forwardRef<HTMLButtonElement, EnhancedFabProps>(
  ({ variant = 'solid', isLoading = false, children, className, sx, ...props }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'glass':
          return {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              transform: 'scale(1.1)',
            },
          }
        case 'solid':
          return {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.1)',
            },
          }
        default:
          return {}
      }
    }

    const muiVariant = variant === 'extended' ? 'extended' : 'circular'

    return (
      <Fab
        ref={ref}
        variant={muiVariant}
        disabled={isLoading}
        className={cn(className)}
        sx={{
          ...getVariantStyles(),
          transition: 'all 0.3s ease',
          ...sx,
        }}
        {...props}
      >
        {isLoading ? <CircularProgress size={24} /> : children}
      </Fab>
    )
  }
)

EnhancedFab.displayName = "EnhancedFab"

// Enhanced Button Group
interface EnhancedButtonGroupProps extends Omit<ButtonGroupProps, 'variant'> {
  variant?: 'glass' | 'solid' | 'outlined' | 'contained' | 'text'
}

export const EnhancedButtonGroup = forwardRef<HTMLDivElement, EnhancedButtonGroupProps>(
  ({ variant = 'contained', className, sx, ...props }, ref) => {
    const getVariantStyles = (): any => {
      if (variant === 'glass') {
        return {
          '& .MuiButton-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            },
          },
        }
      }
      return {}
    }

    const muiVariant = variant === 'glass' || variant === 'solid' ? 'contained' : variant

    return (
      <ButtonGroup
        ref={ref}
        variant={muiVariant}
        className={cn(className)}
        sx={{
          ...getVariantStyles(),
          ...sx,
        }}
        {...props}
      />
    )
  }
)

EnhancedButtonGroup.displayName = "EnhancedButtonGroup"

// Loading Button wrapper
interface LoadingButtonProps extends EnhancedButtonProps {
  loading?: boolean
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, ...props }, ref) => {
    return <EnhancedButton ref={ref} isLoading={loading} {...props} />
  }
)

LoadingButton.displayName = "LoadingButton"
