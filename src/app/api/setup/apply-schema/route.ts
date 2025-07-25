import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    // Apply Prisma schema to the database
    console.log('Applying Prisma schema...')
    
    try {
      // First, generate the Prisma client
      await execAsync('npx prisma generate', { cwd: process.cwd() })
      console.log('Prisma client generated successfully')
      
      // Then push the schema to the database
      await execAsync('npx prisma db push --accept-data-loss', { cwd: process.cwd() })
      console.log('Schema applied successfully')
      
      return NextResponse.json({ 
        success: true,
        message: 'Database schema applied successfully'
      })
      
    } catch (error) {
      console.error('Prisma command failed:', error)
      
      // If db push fails, try with force flag
      try {
        await execAsync('npx prisma db push --force-reset', { cwd: process.cwd() })
        console.log('Schema applied with force reset')
        
        return NextResponse.json({ 
          success: true,
          message: 'Database schema applied with reset'
        })
        
      } catch (forceError) {
        console.error('Force reset also failed:', forceError)
        throw forceError
      }
    }

  } catch (error) {
    console.error('Schema application failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { 
        error: 'Failed to apply database schema',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
