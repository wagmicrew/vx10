"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { LoadingScreen } from '@/components/loading-screen'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  showLoading: () => void
  hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: React.ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide loading screen after initial page load
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Add delay before hiding to allow fade out animation
      setTimeout(() => setIsVisible(false), 500)
    }, 2000) // Show for 2 seconds on initial load

    return () => clearTimeout(timer)
  }, [])

  const setLoading = (loading: boolean) => {
    if (loading) {
      setIsVisible(true)
      setIsLoading(true)
    } else {
      setIsLoading(false)
      setTimeout(() => setIsVisible(false), 500)
    }
  }

  const showLoading = () => setLoading(true)
  const hideLoading = () => setLoading(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, showLoading, hideLoading }}>
      {children}
      {isVisible && <LoadingScreen />}
    </LoadingContext.Provider>
  )
}
