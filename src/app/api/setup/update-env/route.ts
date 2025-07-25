import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, anonKey, serviceKey } = body

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json(
        { error: 'Missing required credentials' },
        { status: 400 }
      )
    }

    // Extract project reference from URL
    const supabaseUrl = new URL(url)
    const projectRef = supabaseUrl.hostname.split('.')[0]

    // Create database URLs (you'll need to get the actual password from user or Supabase)
    const databaseUrl = `postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.co:6543/postgres?pgbouncer=true`
    const directUrl = `postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.co:5432/postgres`

    // Read current .env file
    const envPath = join(process.cwd(), '.env')
    let envContent = ''
    
    try {
      envContent = await readFile(envPath, 'utf-8')
    } catch (error) {
      // File doesn't exist, create new content
      envContent = ''
    }

    // Update or add environment variables
    const envVars = {
      'DATABASE_URL': databaseUrl,
      'DIRECT_URL': directUrl,
      'NEXT_PUBLIC_SUPABASE_URL': url,
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': anonKey,
      'SUPABASE_SERVICE_ROLE_KEY': serviceKey,
      'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET || 'your-secret-key-change-this-in-production',
      'NEXTAUTH_URL': process.env.NEXTAUTH_URL || 'http://localhost:3000'
    }

    // Parse existing env content
    const envLines = envContent.split('\n')
    const updatedLines: string[] = []
    const processedKeys = new Set<string>()

    // Update existing lines
    for (const line of envLines) {
      if (line.trim() === '' || line.startsWith('#')) {
        updatedLines.push(line)
        continue
      }

      const [key] = line.split('=', 1)
      if (key && envVars[key as keyof typeof envVars]) {
        updatedLines.push(`${key}="${envVars[key as keyof typeof envVars]}"`)
        processedKeys.add(key)
      } else {
        updatedLines.push(line)
      }
    }

    // Add new variables that weren't in the file
    for (const [key, value] of Object.entries(envVars)) {
      if (!processedKeys.has(key)) {
        updatedLines.push(`${key}="${value}"`)
      }
    }

    // Write updated .env file
    await writeFile(envPath, updatedLines.join('\n'))

    return NextResponse.json({ 
      success: true,
      message: 'Environment variables updated. Please update DATABASE_URL and DIRECT_URL with your actual password.'
    })

  } catch (error) {
    console.error('Failed to update .env file:', error)
    return NextResponse.json(
      { error: 'Failed to update environment file' },
      { status: 500 }
    )
  }
}
