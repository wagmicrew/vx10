import { NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/database-connection'

export async function GET() {
  try {
    const status = await checkDatabaseConnection()
    
    return NextResponse.json(status)

  } catch (error) {
    console.error('Status check failed:', error)
    
    return NextResponse.json(
      { 
        isConnected: false,
        isConfigured: false,
        needsSetup: true,
        error: 'Status check failed'
      },
      { status: 500 }
    )
  }
}
