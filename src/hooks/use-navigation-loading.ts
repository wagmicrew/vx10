"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useLoading } from '@/components/providers/loading-provider'

export function useNavigationLoading() {
  const { showLoading, hideLoading } = useLoading()
  const pathname = usePathname()

  useEffect(() => {
    // Show loading when pathname changes (for client-side navigation)
    showLoading()
    
    // Hide loading after a short delay to allow page content to load
    const timer = setTimeout(() => {
      hideLoading()
    }, 800)

    return () => clearTimeout(timer)
  }, [pathname, showLoading, hideLoading])

  return { showLoading, hideLoading }
}

// Alternative hook for manual control
export function useManualLoading() {
  const { showLoading, hideLoading, isLoading } = useLoading()
  
  const triggerLoading = (duration: number = 1500) => {
    showLoading()
    setTimeout(() => {
      hideLoading()
    }, duration)
  }

  return { 
    showLoading, 
    hideLoading, 
    isLoading, 
    triggerLoading 
  }
}
