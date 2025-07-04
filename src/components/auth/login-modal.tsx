"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { LogIn, User, Lock } from "lucide-react"
import { GlassmorphismPopup, PopupSection } from "@/components/ui/glassmorphism-popup"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid credentials")
      } else {
        toast.success("Logged in successfully")
        onClose()
        // Refresh the page to update the session
        window.location.reload()
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <GlassmorphismPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Login to VX10"
      icon={<LogIn className="h-4 w-4" />}
      maxWidth="md"
    >
      <div className="relative">
        {/* Enhanced flashing border animation */}
        <div className="absolute inset-0 rounded-2xl">
          <div className="absolute inset-0 rounded-2xl animate-pulse bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75 blur-sm"></div>
          <div className="absolute inset-[1px] rounded-2xl animate-ping bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-50"></div>
          <BorderBeam className="opacity-90" />
        </div>
        <div className="relative z-10">
          <PopupSection>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/40"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-white/40"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
            <h3 className="text-sm font-medium text-white/90">Test Accounts:</h3>
            <div className="grid gap-2 text-xs text-white/70">
              <div>Admin: admin@vx10.com / admin</div>
              <div>Teacher: teacher@vx10.com / teacher</div>
              <div>Student: student@vx10.com / student</div>
            </div>
          </div>
          </PopupSection>
        </div>
      </div>
    </GlassmorphismPopup>
  )
}
