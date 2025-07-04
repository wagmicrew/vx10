"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, Shield, ArrowLeft, User } from "lucide-react"
import { DynamicAdminHeader } from "@/components/dynamic-admin-header"

interface UserType {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  impersonating?: boolean
}

export function DashboardHeader() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setIsImpersonating(parsedUser.impersonating || false)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/inloggning")
  }

  const handleReturnToAdmin = async () => {
    try {
      const response = await fetch("/api/admin/stop-impersonate", {
        method: "POST",
      })

      if (response.ok) {
        const adminUser = { ...user, impersonating: false, role: "admin" }
        localStorage.setItem("user", JSON.stringify(adminUser))
        router.push("/admin")
      }
    } catch (error) {
      console.error("Failed to stop impersonation:", error)
    }
  }

  const getDashboardTitle = () => {
    if (pathname.startsWith("/admin")) return "Admin Panel"
    if (pathname.startsWith("/student")) return "Elevpanel"
    if (pathname.startsWith("/larare")) return "Lärarpanel"
    return "Dashboard"
  }

  const getDashboardUrl = () => {
    if (user?.role === "admin") return "/admin"
    if (user?.role === "trainee") return "/student"
    if (user?.role === "instructor") return "/larare"
    return "/"
  }

  if (!user) return null

  return (
    <>
      {/* Main Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <Image 
                  src="/images/din-logo-small.png" 
                  alt="Din Trafikskola" 
                  width={32}
                  height={32}
                  className="h-8 w-auto" 
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">{getDashboardTitle()}</h1>
                  <p className="text-sm text-gray-600">Din Trafikskola Hässleholm</p>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Impersonation Badge */}
              {isImpersonating && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 glassmorphism">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin-vy
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleReturnToAdmin} className="glassmorphism">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Tillbaka till Admin</span>
                  </Button>
                </div>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-red-500 text-white">
                        {user.first_name?.[0]}
                        {user.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className="w-fit text-xs">
                        {user.role === "admin" ? "Admin" : user.role === "trainee" ? "Elev" : "Lärare"}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardUrl()} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profil" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logga ut</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Header Navigation */}
      {pathname.startsWith("/admin") && <DynamicAdminHeader />}

      {/* Desktop Submenu */}
      {/* <DynamicDesktopSubmenu userRole={user?.role === "trainee" ? "trainee" : user?.role} /> */}
    </>
  )
}
