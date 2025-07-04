"use client"

import { ReactNode } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { BorderBeam } from "@/components/magicui/border-beam"

interface GlassmorphismPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl"
  children: ReactNode
}

export function GlassmorphismPopup({
  isOpen,
  onClose,
  title,
  icon,
  maxWidth = "md",
  children,
}: GlassmorphismPopupProps) {
  if (!isOpen) return null

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={cn(
          "relative w-full rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl",
          maxWidthClasses[maxWidth]
        )}
      >
        {/* MagicUI BorderBeam */}
        <BorderBeam
          size={60}
          duration={12}
          delay={9}
          colorFrom="#dc2626"
          colorTo="#ef4444"
          className="rounded-2xl"
        />
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white">
                {icon}
              </div>
            )}
            <h2 className="text-xl font-semibold text-white drop-shadow-sm">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="custom-scrollbar max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

interface PopupSectionProps {
  title?: string
  icon?: ReactNode
  children: ReactNode
}

export function PopupSection({ title, icon, children }: PopupSectionProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      {title && (
        <div className="mb-4 flex items-center gap-2">
          {icon && (
            <div className="flex h-6 w-6 items-center justify-center text-white/80">
              {icon}
            </div>
          )}
          <h3 className="font-medium text-white/90 drop-shadow-sm">{title}</h3>
        </div>
      )}
      {children}
    </div>
  )
}

interface DetailRowProps {
  label: string
  value: string | ReactNode
}

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-white/70">{label}</span>
      <span className="text-sm font-medium text-white">
        {typeof value === "string" ? value : value}
      </span>
    </div>
  )
}

interface StatusBadgeProps {
  status: string
  variant: "success" | "warning" | "error" | "info"
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const variants = {
    success: "bg-green-500/20 text-green-300 border-green-500/30",
    warning: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    error: "bg-red-500/20 text-red-300 border-red-500/30",
    info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm",
        variants[variant]
      )}
    >
      {status}
    </span>
  )
}
