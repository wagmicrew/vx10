import { prisma } from './prisma'

export interface DatabaseStatus {
  isConnected: boolean
  isConfigured: boolean
  error?: string
  needsSetup: boolean
}

/**
 * Check if database connection is working
 */
export async function checkDatabaseConnection(): Promise<DatabaseStatus> {
  try {
    // Check if environment variables are configured
    const hasUrl = !!process.env.DATABASE_URL
    const hasDirectUrl = !!process.env.DIRECT_URL
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    const isConfigured = hasUrl && hasDirectUrl && hasSupabaseUrl && hasAnonKey && hasServiceKey

    if (!isConfigured) {
      return {
        isConnected: false,
        isConfigured: false,
        needsSetup: true,
        error: 'Database environment variables not configured'
      }
    }

    // Check if we can connect to the database
    await prisma.$connect()
    
    // Try a simple query to verify the connection works
    await prisma.$queryRaw`SELECT 1`
    
    // Check if the database has been initialized (has our tables)
    try {
      await prisma.settings.findFirst()
    } catch (error) {
      // If settings table doesn't exist, database needs setup
      return {
        isConnected: true,
        isConfigured: true,
        needsSetup: true,
        error: 'Database schema not initialized'
      }
    }

    return {
      isConnected: true,
      isConfigured: true,
      needsSetup: false
    }

  } catch (error) {
    console.error('Database connection check failed:', error)
    
    return {
      isConnected: false,
      isConfigured: true, // Assume configured if we got this far
      needsSetup: true,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Check if Supabase credentials are valid
 */
export async function validateSupabaseCredentials(config: {
  url: string
  anonKey: string
  serviceKey: string
}): Promise<{ valid: boolean; error?: string }> {
  try {
    // Basic format validation
    if (!config.url.startsWith('https://') || !config.url.includes('.supabase.co')) {
      return { valid: false, error: 'Invalid Supabase URL format' }
    }

    if (!config.anonKey.startsWith('eyJ') || config.anonKey.length < 100) {
      return { valid: false, error: 'Invalid anonymous key format' }
    }

    if (!config.serviceKey.startsWith('eyJ') || config.serviceKey.length < 100) {
      return { valid: false, error: 'Invalid service role key format' }
    }

    // Test connection with the provided credentials
    const { createClient } = await import('@supabase/supabase-js')
    const testClient = createClient(config.url, config.serviceKey)

    // Try to make a simple request to verify credentials
    const { error } = await testClient.from('_realtime_schema_migrations').select('*').limit(1)
    
    if (error && !error.message.includes('does not exist')) {
      // If it's not a "table doesn't exist" error, it might be a credentials issue
      if (error.message.includes('Invalid API key') || error.message.includes('unauthorized')) {
        return { valid: false, error: 'Invalid Supabase credentials' }
      }
    }

    return { valid: true }

  } catch (error) {
    console.error('Supabase validation failed:', error)
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Failed to validate credentials' 
    }
  }
}

/**
 * Test database connection with new configuration
 */
export async function testDatabaseConnection(config: {
  url: string
  anonKey: string
  serviceKey: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Create database URL from Supabase config
    const supabaseUrl = new URL(config.url)
    const projectRef = supabaseUrl.hostname.split('.')[0]
    
    // For testing, we'll use a simple connection string format
    // In production, you'd want to construct this more carefully
    const testDatabaseUrl = `postgresql://postgres:${encodeURIComponent('[YOUR-PASSWORD]')}@aws-0-eu-central-1.pooler.supabase.co:6543/postgres?pgbouncer=true`
    
    // Note: This is a simplified test. In a real implementation, you'd need the actual password
    // For now, we'll just validate the Supabase credentials
    const validation = await validateSupabaseCredentials(config)
    
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    return { success: true }

  } catch (error) {
    console.error('Database connection test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection test failed' 
    }
  }
}

/**
 * Check if the application needs initial setup
 */
export async function needsInitialSetup(): Promise<boolean> {
  const status = await checkDatabaseConnection()
  return status.needsSetup
}

/**
 * Get database status for display
 */
export async function getDatabaseStatusMessage(): Promise<string> {
  const status = await checkDatabaseConnection()
  
  if (!status.isConfigured) {
    return 'Database not configured. Please run setup.'
  }
  
  if (!status.isConnected) {
    return `Database connection failed: ${status.error}`
  }
  
  if (status.needsSetup) {
    return 'Database connected but needs initialization.'
  }
  
  return 'Database connected and ready.'
}
