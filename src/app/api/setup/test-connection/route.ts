import { NextRequest, NextResponse } from 'next/server'
import { validateSupabaseCredentials } from '@/lib/database-connection'

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

    const validation = await validateSupabaseCredentials({
      url,
      anonKey,
      serviceKey
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json(
      { error: 'Connection test failed' },
      { status: 500 }
    )
  }
}
