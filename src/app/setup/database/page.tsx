import { Suspense } from 'react'
import SupabaseSetup from '@/components/setup/SupabaseSetup'
import { checkDatabaseConnection } from '@/lib/database-connection'
import { redirect } from 'next/navigation'

export default async function DatabaseSetupPage() {
  // Check if database is already set up
  const status = await checkDatabaseConnection()
  
  if (!status.needsSetup) {
    // Database is already configured, redirect to main app
    redirect('/')
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SupabaseSetup />
    </Suspense>
  )
}
