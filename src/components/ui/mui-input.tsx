"use client"

import { forwardRef } from "react"
import { 
  TextField, 
  TextFieldProps, 
  IconButton, 
  InputAdornment,
  Autocomplete,
  AutocompleteProps,
  Chip
} from "@mui/material"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Enhanced TextField with glassmorphism styling
interface EnhancedTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'glass' | 'solid' | 'outlined'
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
}

export const EnhancedTextField = forwardRef<HTMLDivElement, EnhancedTextFieldProps>(
  ({ variant = 'solid', startIcon, endIcon, className, sx, ...props }, ref) => {
    const getVariantStyles = (): any => {
      switch (variant) {
        case 'glass':
          return {
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '& fieldset': {
                border: 'none',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: 'primary.main',
              },
            },
            '& input': {
              color: 'white',
            },
          }
        case 'outlined':
          return {
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'transparent',
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }
        case 'solid':
        default:
          return {}
      }
    }

    return (
      <TextField
        ref={ref}
        className={cn(className)}
        sx={{
          ...getVariantStyles(),
          ...sx,
        }}
        InputProps={{
          startAdornment: startIcon && (
            <InputAdornment position="start">
              {startIcon}
            </InputAdornment>
          ),
          endAdornment: endIcon && (
            <InputAdornment position="end">
              {endIcon}
            </InputAdornment>
          ),
          ...props.InputProps,
        }}
        {...props}
      />
    )
  }
)

EnhancedTextField.displayName = "EnhancedTextField"

// Password field with toggle visibility
interface PasswordFieldProps extends Omit<EnhancedTextFieldProps, 'type'> {
  showPasswordToggle?: boolean
}

export const PasswordField = forwardRef<HTMLDivElement, PasswordFieldProps>(
  ({ showPasswordToggle = true, endIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const passwordToggle = showPasswordToggle && (
      <IconButton
        onClick={() => setShowPassword(!showPassword)}
        edge="end"
        size="small"
        sx={{ 
          color: props.variant === 'glass' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' 
        }}
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </IconButton>
    )

    return (
      <EnhancedTextField
        ref={ref}
        type={showPassword ? "text" : "password"}
        endIcon={passwordToggle || endIcon}
        {...props}
      />
    )
  }
)

PasswordField.displayName = "PasswordField"

// Enhanced Autocomplete with glassmorphism styling
interface EnhancedAutocompleteProps<T> extends Omit<AutocompleteProps<T, boolean, boolean, boolean>, 'renderInput'> {
  label?: string
  placeholder?: string
  variant?: 'glass' | 'solid' | 'outlined'
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  error?: boolean
  helperText?: string
}

export function EnhancedAutocomplete<T>({
  label,
  placeholder,
  variant = 'solid',
  startIcon,
  endIcon,
  error,
  helperText,
  sx,
  ...props
}: EnhancedAutocompleteProps<T>) {
  return (
    <Autocomplete
      sx={sx}
      renderInput={(params) => (
        <EnhancedTextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant={variant}
          startIcon={startIcon}
          endIcon={endIcon}
          error={error}
          helperText={helperText}
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index })
          return (
            <Chip
              key={key}
              label={typeof option === 'string' ? option : String(option)}
              {...tagProps}
              size="small"
              sx={{
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiChip-deleteIcon': {
                  color: 'primary.contrastText',
                },
              }}
            />
          )
        })
      }
      {...props}
    />
  )
}

// Search field with search icon
interface SearchFieldProps extends Omit<EnhancedTextFieldProps, 'type'> {
  onSearch?: (value: string) => void
}

export const SearchField = forwardRef<HTMLDivElement, SearchFieldProps>(
  ({ onSearch, onChange, startIcon, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      onChange?.(event)
      onSearch?.(value)
    }

    return (
      <EnhancedTextField
        ref={ref}
        type="search"
        startIcon={startIcon || <div className="h-4 w-4 text-gray-400">🔍</div>}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

SearchField.displayName = "SearchField"
