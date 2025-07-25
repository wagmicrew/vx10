import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    console.log('Seeding database with initial data...')
    
    // Run the seed script
    await execAsync('node prisma/seed.js', { cwd: process.cwd() })
    console.log('Database seeded successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'Database seeded with initial data'
    })

  } catch (error) {
    console.error('Database seeding failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to seed database',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
