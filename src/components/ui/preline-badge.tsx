import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        primary: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
        secondary: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        success: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
        danger: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500",
        dark: "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800",
        outline: "border border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400",
        "outline-primary": "border border-red-200 text-red-800 dark:border-red-700/50 dark:text-red-400"
      },
      size: {
        sm: "py-1 px-2 text-xs",
        default: "py-1.5 px-3 text-xs",
        lg: "py-2 px-4 text-sm"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  removable?: boolean
  onRemove?: () => void
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, removable, onRemove, children, ...props }, ref) => {
    return (
      <span
        className={cn(badgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 size-4 inline-flex items-center justify-center rounded-full text-current hover:bg-gray-200 dark:hover:bg-gray-600 ml-1.5"
          >
            <span className="sr-only">Remove badge</span>
            <svg
              className="flex-shrink-0 size-3"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m18 6-12 12"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        )}
      </span>
    )
  }
)
Badge.displayName = "Badge"

// Dot Badge variant for notifications
const DotBadge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <span
        className={cn(
          "flex size-2 rounded-full",
          variant === "primary" && "bg-red-500",
          variant === "success" && "bg-green-500",
          variant === "warning" && "bg-yellow-500",
          variant === "danger" && "bg-red-500",
          variant === "info" && "bg-blue-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
DotBadge.displayName = "DotBadge"

export { Badge, DotBadge, badgeVariants }
