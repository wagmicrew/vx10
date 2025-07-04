"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import Navigation with no SSR to prevent hydration issues
const NavigationComponent = dynamic(
  () => import("./navigation").then((mod) => ({ default: mod.Navigation })),
  {
    ssr: false,
    loading: () => (
      <>
        {/* Server-side placeholder header */}
        <header className="bg-black text-white py-4 px-6 relative z-50 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-red-600 rounded"></div>
              <div className="flex flex-col">
                <h1 className="text-red-600 text-xl font-normal leading-tight">
                  Trafikskola
                </h1>
                <div className="text-red-600 text-sm font-normal leading-tight ml-6 italic">
                  Hässleholm
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Static navigation placeholder */}
        <div className="hidden md:block bg-white border-b border-gray-200 h-16" />
      </>
    ),
  }
)

export function ClientNavigation() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <>
        {/* Server-side placeholder header */}
        <header className="bg-black text-white py-4 px-6 relative z-50 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-red-600 rounded"></div>
              <div className="flex flex-col">
                <h1 className="text-red-600 text-xl font-normal leading-tight">
                  Trafikskola
                </h1>
                <div className="text-red-600 text-sm font-normal leading-tight ml-6 italic">
                  Hässleholm
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Static navigation placeholder */}
        <div className="hidden md:block bg-white border-b border-gray-200 h-16" />
      </>
    )
  }

  return <NavigationComponent />
}
