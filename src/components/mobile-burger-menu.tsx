"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Home,
  User,
  Calendar,
  BookOpen,
  Package,
  DollarSign,
  Settings,
  Shield,
  Users,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowLeft,
  LogOut,
  LayoutDashboard,
} from "lucide-react"
import Link from "next/link"

interface MenuItem {
  id: number
  title: string
  slug: string
  url: string
  icon: string
  sort_order: number
  requires_auth: boolean
}

interface MobileBurgerMenuProps {
  isOpen: boolean
  onClose: () => void
  userRole: "admin" | "student" | "instructor"
  userName: string
  userEmail: string
  isImpersonating?: boolean
  onLogout: () => void
  onReturnToAdmin?: () => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  User,
  Calendar,
  BookOpen,
  Package,
  DollarSign,
  Settings,
  Shield,
  Users,
  LayoutDashboard,
  Phone,
  Mail,
  MapPin,
  Clock,
}

export function MobileBurgerMenu({
  isOpen,
  onClose,
  userRole,
  userName,
  userEmail,
  isImpersonating = false,
  onLogout,
  onReturnToAdmin,
}: MobileBurgerMenuProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [dashboardMenuItems, setDashboardMenuItems] = useState<MenuItem[]>([])
  const [mainMenuItems, setMainMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const getDefaultDashboardMenu = useCallback((): MenuItem[] => {
    switch (userRole) {
      case "admin":
        return [
          {
            id: 1,
            title: "Dashboard",
            slug: "admin-dashboard",
            url: "/admin",
            icon: "LayoutDashboard",
            sort_order: 1,
            requires_auth: true,
          },
          {
            id: 2,
            title: "Användare",
            slug: "admin-users",
            url: "/admin/users",
            icon: "Users",
            sort_order: 2,
            requires_auth: true,
          },
          {
            id: 3,
            title: "Schema",
            slug: "admin-schedule",
            url: "/admin/schedule",
            icon: "Calendar",
            sort_order: 3,
            requires_auth: true,
          },
          {
            id: 4,
            title: "Quiz",
            slug: "admin-quiz",
            url: "/admin/quiz",
            icon: "BookOpen",
            sort_order: 4,
            requires_auth: true,
          },
          {
            id: 5,
            title: "Ekonomi",
            slug: "admin-economics",
            url: "/admin/economics",
            icon: "DollarSign",
            sort_order: 5,
            requires_auth: true,
          },
        ]
      case "student":
        return [
          {
            id: 1,
            title: "Profil",
            slug: "student-profile",
            url: "/student",
            icon: "User",
            sort_order: 1,
            requires_auth: true,
          },
          {
            id: 2,
            title: "Boka",
            slug: "student-booking",
            url: "/boka-korning",
            icon: "Calendar",
            sort_order: 2,
            requires_auth: true,
          },
          {
            id: 3,
            title: "Quiz",
            slug: "student-quiz",
            url: "/quiz",
            icon: "BookOpen",
            sort_order: 3,
            requires_auth: true,
          },
          {
            id: 4,
            title: "Paket",
            slug: "student-packages",
            url: "/student/packages",
            icon: "Package",
            sort_order: 4,
            requires_auth: true,
          },
        ]
      case "instructor":
        return [
          {
            id: 1,
            title: "Dashboard",
            slug: "instructor-dashboard",
            url: "/larare",
            icon: "Home",
            sort_order: 1,
            requires_auth: true,
          },
          {
            id: 2,
            title: "Schema",
            slug: "instructor-schedule",
            url: "/larare/schedule",
            icon: "Calendar",
            sort_order: 2,
            requires_auth: true,
          },
          {
            id: 3,
            title: "Elever",
            slug: "instructor-students",
            url: "/larare/students",
            icon: "Users",
            sort_order: 3,
            requires_auth: true,
          },
          {
            id: 4,
            title: "Profil",
            slug: "instructor-profile",
            url: "/larare/profile",
            icon: "User",
            sort_order: 4,
            requires_auth: true,
          },
        ]
      default:
        return []
    }
  }, [userRole])

  const getDefaultMainMenu = useCallback((): MenuItem[] => {
    return [
      { id: 1, title: "Hem", slug: "hem", url: "/", icon: "Home", sort_order: 1, requires_auth: false },
      { id: 2, title: "Om oss", slug: "om-oss", url: "/om-oss", icon: "User", sort_order: 2, requires_auth: false },
      {
        id: 3,
        title: "Våra Tjänster",
        slug: "vara-tjanster",
        url: "/vara-tjanster",
        icon: "BookOpen",
        sort_order: 3,
        requires_auth: false,
      },
      {
        id: 4,
        title: "Lokalerna",
        slug: "lokalerna",
        url: "/lokalerna",
        icon: "MapPin",
        sort_order: 4,
        requires_auth: false,
      },
    ]
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        // Fetch dashboard menu items
        const dashboardResponse = await fetch(
          `/api/menu?category=dashboard&role=${userRole === "student" ? "trainee" : userRole}`,
        )
        const dashboardData = await dashboardResponse.json()

        // Fetch main menu items
        const mainResponse = await fetch(
          `/api/menu?category=main&role=${userRole === "student" ? "trainee" : userRole}`,
        )
        const mainData = await mainResponse.json()

        setDashboardMenuItems(dashboardData.menuItems || [])
        setMainMenuItems(mainData.menuItems || [])
      } catch (error) {
        console.error("Error fetching menu items:", error)
        // Set fallback menus
        setDashboardMenuItems(getDefaultDashboardMenu())
        setMainMenuItems(getDefaultMainMenu())
      } finally {
        setIsLoading(false)
      }
    }

    if (isVisible) {
      fetchMenuItems()
    }
  }, [isVisible, userRole, getDefaultDashboardMenu, getDefaultMainMenu])

  const handleClose = () => {
    onClose()
  }

  const handleLinkClick = () => {
    onClose()
  }

  if (!isVisible) return null

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin"
      case "instructor":
        return "Instruktör"
      case "student":
        return "Elev"
      default:
        return "Användare"
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] glassmorphism border-r border-white/20 z-50 transform transition-transform duration-300 ease-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meny
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClose} className="glassmorphism">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{userName}</p>
                <p className="text-sm text-gray-600 truncate">{userEmail}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={userRole === "admin" ? "destructive" : userRole === "instructor" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {getRoleDisplayName(userRole)}
                  </Badge>
                  {isImpersonating && (
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin-vy
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Dashboard Menu */}
            {dashboardMenuItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {userRole === "admin" ? "Administration" : userRole === "instructor" ? "Instruktör" : "Elevpanel"}
                </h3>
                <nav className="space-y-2">
                  {dashboardMenuItems.map((item) => {
                    const Icon = iconMap[item.icon] || Home
                    return (
                      <Link key={item.id} href={item.url} onClick={handleLinkClick}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/20 transition-colors">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">{item.title}</span>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            )}

            {/* Main Site Navigation */}
            {mainMenuItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Webbplats</h3>
                <nav className="space-y-2">
                  {mainMenuItems.map((item) => {
                    const Icon = iconMap[item.icon] || Home
                    return (
                      <Link key={item.id} href={item.url} onClick={handleLinkClick}>
                        <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/20 transition-colors">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-700">{item.title}</span>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="p-4 border-t border-white/20">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Kontakt</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">0760-389192</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">info@dintrafikskolahlm.se</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Östergatan 3a, Hässleholm</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Mån-Fre 08:00-18:00</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/20 space-y-2">
            {isImpersonating && onReturnToAdmin && (
              <Button onClick={onReturnToAdmin} variant="outline" className="w-full glassmorphism">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka till Admin
              </Button>
            )}
            <Button onClick={onLogout} variant="destructive" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
