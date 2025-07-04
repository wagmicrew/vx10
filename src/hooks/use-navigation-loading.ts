"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function useNavigationLoading() {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Set navigating state when pathname changes
    setIsNavigating(true)
    
    // Clear navigating state after a short delay
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [pathname])

  return { isNavigating }
}

// Simple loading state hook for manual control
export function useManualLoading() {
  const [isLoading, setIsLoading] = useState(false)
  
  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)
  
  const triggerLoading = (duration: number = 1500) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, duration)
  }

  return { 
    isLoading,
    startLoading, 
    stopLoading, 
    triggerLoading 
  }
}
