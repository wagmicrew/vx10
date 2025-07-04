import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "py-3 px-4 block w-full rounded-lg text-sm focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "border-gray-200 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-gray-600",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500 dark:bg-gray-800 dark:border-red-500 dark:text-gray-400",
        success: "border-green-500 focus:border-green-500 focus:ring-green-500 dark:bg-gray-800 dark:border-green-500 dark:text-gray-400"
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, label, helperText, error, ...props }, ref) => {
    const inputId = React.useId()
    const hasError = Boolean(error)
    const finalVariant = hasError ? "error" : variant

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-2 dark:text-white">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(inputVariants({ variant: finalVariant, className }))}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            "text-xs mt-2",
            hasError ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Floating Label Input
const FloatingInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, label, ...props }, ref) => {
    const inputId = React.useId()

    return (
      <div className="relative">
        <input
          id={inputId}
          type={type}
          className={cn(
            "peer py-4 px-4 block w-full bg-gray-100 border-transparent rounded-lg text-sm placeholder:text-transparent focus:border-red-500 focus:ring-red-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-700 dark:border-transparent dark:text-gray-400 dark:focus:ring-gray-600 focus:pt-6 focus:pb-2 [&:not(:placeholder-shown)]:pt-6 [&:not(:placeholder-shown)]:pb-2 autofill:pt-6 autofill:pb-2",
            className
          )}
          placeholder={label}
          ref={ref}
          {...props}
        />
        {label && (
          <label
            htmlFor={inputId}
            className="absolute top-0 start-0 p-4 h-full text-sm truncate pointer-events-none transition ease-in-out duration-100 border border-transparent peer-disabled:opacity-50 peer-disabled:pointer-events-none peer-focus:text-xs peer-focus:-translate-y-1.5 peer-focus:text-gray-500 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-1.5 peer-[:not(:placeholder-shown)]:text-gray-500 dark:text-gray-500 dark:peer-focus:text-gray-400 dark:peer-[:not(:placeholder-shown)]:text-gray-400"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { Input, FloatingInput, inputVariants }
