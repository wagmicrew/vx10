import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-gray-800",
        secondary:
          "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500 focus:ring-offset-white dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800",
        outline:
          "border-red-200 text-red-800 hover:border-red-300 hover:text-red-900 focus:ring-red-500 focus:ring-offset-white dark:border-red-700 dark:text-red-400 dark:hover:text-red-300 dark:focus:ring-offset-gray-800",
        ghost:
          "text-red-800 hover:bg-red-100 hover:text-red-900 focus:ring-red-500 focus:ring-offset-white dark:text-red-400 dark:hover:bg-red-800/30 dark:hover:text-red-300 dark:focus:ring-offset-gray-800",
        soft:
          "bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-500 focus:ring-offset-white dark:bg-red-800/30 dark:text-red-400 dark:hover:bg-red-800/50 dark:focus:ring-offset-gray-800",
        white:
          "bg-white text-gray-800 hover:bg-gray-50 border-gray-200 focus:ring-gray-500 focus:ring-offset-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800",
        tonal:
          "bg-red-600/10 text-red-600 hover:bg-red-600/20 focus:ring-red-500 focus:ring-offset-white dark:text-red-500 dark:hover:bg-red-600/30 dark:focus:ring-offset-gray-800",
        danger:
          "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-gray-800"
      },
      size: {
        sm: "py-2 px-3 text-xs",
        default: "py-3 px-4 text-sm",
        lg: "py-4 px-6 text-base",
        xl: "py-5 px-8 text-lg"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
