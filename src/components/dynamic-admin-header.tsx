"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Calendar, 
  Settings, 
  BarChart3, 
  FileText, 
  CreditCard,
  UserCheck,
  BookOpen,
  Mail
} from "lucide-react"

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: BarChart3,
    exact: true
  },
  {
    label: "Användare",
    href: "/admin/users",
    icon: Users,
    badge: "Ny"
  },
  {
    label: "Bokningar",
    href: "/admin/bookings",
    icon: Calendar
  },
  {
    label: "Lektioner",
    href: "/admin/lessons",
    icon: BookOpen
  },
  {
    label: "Betyg",
    href: "/admin/assessments",
    icon: UserCheck
  },
  {
    label: "Fakturor",
    href: "/admin/invoices",
    icon: FileText
  },
  {
    label: "Betalningar",
    href: "/admin/payments",
    icon: CreditCard
  },
  {
    label: "E-post",
    href: "/admin/emails",
    icon: Mail
  },
  {
    label: "Inställningar",
    href: "/admin/settings",
    icon: Settings
  }
]

export function DynamicAdminHeader() {
  const pathname = usePathname()

  const isActiveLink = (href: string, exact?: boolean) => {
    if (!pathname) return false
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center space-x-1 py-3 overflow-x-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveLink(item.href, item.exact)
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`
                    flex items-center space-x-2 whitespace-nowrap
                    ${isActive 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="ml-1 text-xs bg-red-100 text-red-800"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
