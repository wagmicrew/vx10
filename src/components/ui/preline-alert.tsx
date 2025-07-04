import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "bg-blue-50 border border-blue-200 text-sm text-blue-800 rounded-lg p-4 dark:bg-blue-800/10 dark:border-blue-900 dark:text-blue-500",
  {
    variants: {
      variant: {
        default: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-800/10 dark:border-blue-900 dark:text-blue-500",
        primary: "bg-red-50 border-red-200 text-red-800 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500",
        success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-800/10 dark:border-green-900 dark:text-green-500",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-800/10 dark:border-yellow-900 dark:text-yellow-500",
        danger: "bg-red-50 border-red-200 text-red-800 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500",
        dark: "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  dismissible?: boolean
  onDismiss?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, dismissible, onDismiss, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), "relative", className)}
      {...props}
    >
      <div className="flex">
        <div className="flex-1">
          {children}
        </div>
        {dismissible && (
          <div className="ml-auto">
            <button
              type="button"
              className="inline-flex flex-shrink-0 justify-center items-center size-5 rounded-lg text-current hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-blue-50 transition-all text-sm dark:focus:ring-gray-700 dark:focus:ring-offset-blue-800/10"
              onClick={onDismiss}
            >
              <span className="sr-only">Close</span>
              <svg
                className="flex-shrink-0 size-4"
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
          </div>
        )}
      </div>
    </div>
  )
)
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Toast-style Alert
const ToastAlert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, dismissible, onDismiss, children, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        alertVariants({ variant }),
        "max-w-xs bg-white border border-gray-200 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700",
        className
      )}
      {...props}
    >
      <div className="flex p-4">
        <div className="flex-1">
          {children}
        </div>
        {dismissible && (
          <div className="ml-auto">
            <button
              type="button"
              className="inline-flex flex-shrink-0 justify-center items-center size-5 rounded-lg text-gray-800 opacity-50 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all text-sm dark:text-white dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800"
              onClick={onDismiss}
            >
              <span className="sr-only">Close</span>
              <svg
                className="flex-shrink-0 size-4"
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
          </div>
        )}
      </div>
    </div>
  )
)
ToastAlert.displayName = "ToastAlert"

export { Alert, AlertTitle, AlertDescription, ToastAlert, alertVariants }
