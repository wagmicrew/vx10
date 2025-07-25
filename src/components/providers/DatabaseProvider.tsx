'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SupabaseSetup from '@/components/setup/SupabaseSetup'
import { DatabaseStatus } from '@/lib/database-connection'

interface DatabaseContextType {
  status: DatabaseStatus | null
  isLoading: boolean
  checkStatus: () => Promise<void>
}

const DatabaseContext = createContext<DatabaseContextType>({
  status: null,
  isLoading: true,
  checkStatus: async () => {}
})

export const useDatabaseStatus = () => useContext(DatabaseContext)

interface DatabaseProviderProps {
  children: React.ReactNode
}

export default function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/setup/status')
      const statusData = await response.json()
      setStatus(statusData)
    } catch (error) {
      console.error('Failed to check database status:', error)
      setStatus({
        isConnected: false,
        isConfigured: false,
        needsSetup: true,
        error: 'Failed to check database status'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const handleSetupComplete = () => {
    // Refresh the status after setup
    checkStatus().then(() => {
      // Redirect to home page
      router.push('/')
      router.refresh()
    })
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking database connection...</p>
        </div>
      </div>
    )
  }

  // Show setup if database needs configuration
  if (status?.needsSetup) {
    return <SupabaseSetup onSetupComplete={handleSetupComplete} />
  }

  // Database is ready, render the app
  return (
    <DatabaseContext.Provider value={{ status, isLoading, checkStatus }}>
      {children}
    </DatabaseContext.Provider>
  )
}
