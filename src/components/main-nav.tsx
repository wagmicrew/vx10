"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, BookOpen, Users, Settings, Car, ClipboardList, BarChart3, UserCheck } from "lucide-react"

interface MainNavProps {
  className?: string
  userRole?: string
}

export function MainNav({ className, userRole = "pupil" }: MainNavProps) {
  const pathname = usePathname()

  const pupilNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Mina lektioner",
      href: "/dashboard/lessons",
      icon: Calendar,
    },
    {
      title: "Boka lektion",
      href: "/dashboard/book",
      icon: Car,
    },
    {
      title: "Teoritest",
      href: "/quiz",
      icon: BookOpen,
    },
    {
      title: "Profil",
      href: "/dashboard/profile",
      icon: UserCheck,
    },
  ]

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: Home,
    },
    {
      title: "Användare",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Lektioner",
      href: "/admin/lessons",
      icon: Calendar,
    },
    {
      title: "Teoritest",
      href: "/admin/quiz",
      icon: BookOpen,
    },
    {
      title: "Rapporter",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      title: "Inställningar",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  const instructorNavItems = [
    {
      title: "Dashboard",
      href: "/instructor",
      icon: Home,
    },
    {
      title: "Mina lektioner",
      href: "/instructor/lessons",
      icon: Calendar,
    },
    {
      title: "Elever",
      href: "/instructor/students",
      icon: Users,
    },
    {
      title: "Schema",
      href: "/instructor/schedule",
      icon: ClipboardList,
    },
    {
      title: "Profil",
      href: "/instructor/profile",
      icon: UserCheck,
    },
  ]

  const getNavItems = () => {
    switch (userRole) {
      case "admin":
        return adminNavItems
      case "instructor":
        return instructorNavItems
      default:
        return pupilNavItems
    }
  }

  const navItems = getNavItems()

  return (
    <nav className={cn("flex flex-col space-y-1", className)}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive =
          pathname === item.href ||
          (pathname &&
            item.href !== "/dashboard" &&
            item.href !== "/admin" &&
            item.href !== "/instructor" &&
            pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-x-3 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200",
              isActive
                ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

// Ensure named export is available
