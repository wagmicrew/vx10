"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ContactForm } from "@/components/contact-form"
import {
  MapPin,
  Phone,
  Mail,
  Car,
  User,
  Calendar,
  Building2,
  Home,
  Menu,
  X,
} from "lucide-react"

// Static menu items (no database dependency)
const menuItems = [
  { id: 1, title: "Hem", slug: "hem", url: "/", icon: "Home" },
  { id: 2, title: "Om oss", slug: "om-oss", url: "/om-oss", icon: "User" },
  { id: 3, title: "Våra Tjänster", slug: "vara-tjanster", url: "/vara-tjanster", icon: "Car" },
  { id: 4, title: "Lokalerna", slug: "lokalerna", url: "/lokalerna", icon: "Building2" },
  { id: 5, title: "Boka körning", slug: "boka-korning", url: "/boka-korning", icon: "Calendar" },
]

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  User,
  Car,
  Building2,
  Calendar,
  Mail,
}

export function Navigation() {
  const [showContactForm, setShowContactForm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Header */}
      <header className="bg-black text-white py-4 px-6 relative z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo with custom text */}
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <Image
              src="/images/din-logo.png"
              alt="Din Trafikskola Hässleholm - Körkort och körkortsutbildning"
              className="h-12 sm:h-14 md:h-16 lg:h-18 w-auto"
              width={72}
              height={72}
              sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, (max-width: 1024px) 64px, 72px"
              priority
            />
            <div className="flex flex-col">
              <h1
                className="text-red-600 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight"
                style={{ fontFamily: 'Didot, Bodoni, "Playfair Display", serif' }}
              >
                Trafikskola
              </h1>
              <div
                className="text-red-600 text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-tight ml-6 sm:ml-8 md:ml-10 lg:ml-12 italic"
                style={{ fontFamily: 'Didot, Bodoni, "Playfair Display", serif' }}
              >
                Hässleholm
              </div>
            </div>
          </Link>

          {/* Desktop Contact info */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Östergatan 3a, 281 30 Hässleholm</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-red-500" />
              <span>0760-389192</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-red-500" />
              <span>info@dintrafikskolahlm.se</span>
            </div>
          </div>

          {/* Mobile contact and menu */}
          <div className="flex lg:hidden items-center space-x-4">
            <a
              href="tel:0760389192"
              className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors"
              aria-label="Ring Din Trafikskola Hässleholm på 0760-389192"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">0760-389192</span>
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-red-400 transition-colors"
              aria-label="Öppna meny"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <nav className="hidden md:block sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex justify-center">
            <div className="flex space-x-1 py-3">
              {menuItems.map((item) => {
                const Icon = iconMap[item.icon] || Home
                const isActive = pathname === item.url
                return (
                  <Link
                    key={item.id}
                    href={item.url}
                    className={`flex items-center space-x-2 px-4 lg:px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap text-sm lg:text-base ${
                      isActive
                        ? "bg-red-600 text-white shadow-lg transform scale-105"
                        : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                    }`}
                    aria-label={`Gå till ${item.title}`}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>{item.title}</span>
                  </Link>
                )
              })}
              <Button
                variant="ghost"
                onClick={() => setShowContactForm(true)}
                className="flex items-center space-x-2 px-4 lg:px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap text-sm lg:text-base text-gray-700 hover:text-red-600 hover:bg-red-50"
              >
                <Mail className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Kontakt</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - iOS Style */}
      <div className="md:hidden">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Mobile Menu Panel */}
        <div
          className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-[60] transform transition-transform duration-300 ease-out shadow-2xl ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Mobile Menu Header */}
          <div className="bg-red-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image src="/images/din-logo-small.png" alt="Din Trafikskola" className="h-8 w-8" width={32} height={32} sizes="32px" />
                <span className="font-semibold text-lg">Meny</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-red-700 rounded-full transition-colors"
                aria-label="Stäng meny"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Items */}
          <div className="py-4">
            {menuItems.map((item) => {
              const Icon = iconMap[item.icon] || Home
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 px-6 py-4 text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-red-50 text-red-600 border-r-4 border-red-600"
                      : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-red-600" : "text-gray-500"}`} />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 border-t">
            <Button
              onClick={() => {
                setShowContactForm(true)
                setMobileMenuOpen(false)
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold"
            >
              <Mail className="w-4 h-4 mr-2" />
              Kontakta oss
            </Button>
            <div className="mt-4 text-center">
              <a
                href="tel:0760389192"
                className="text-red-600 font-semibold text-lg hover:text-red-700 transition-colors"
              >
                📞 0760-389192
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Tab Bar - iOS Style */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-pb">
          <div className="grid grid-cols-4 h-20">
            {menuItems.slice(0, 4).map((item) => {
              const Icon = iconMap[item.icon] || Home
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                    isActive ? "text-red-600" : "text-gray-500 active:text-red-600"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-red-600" : "text-gray-500"}`} />
                  <span className="text-xs font-medium">{item.title.split(" ")[0]}</span>
                  {isActive && <div className="w-1 h-1 bg-red-600 rounded-full" />}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Add padding to body content for bottom tab bar */}
        <div className="pb-20" />
      </div>

      {/* Contact Form Modal */}
      <ContactForm isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
    </>
  )
}
