'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Database, Key, Globe, CheckCircle, XCircle } from 'lucide-react'

interface SupabaseSetupProps {
  onSetupComplete?: () => void
}

interface SupabaseConfig {
  url: string
  anonKey: string
  serviceKey: string
  dbPassword: string
}

interface SetupStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'loading' | 'success' | 'error'
  error?: string
}

export default function SupabaseSetup({ onSetupComplete }: SupabaseSetupProps) {
  const [config, setConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    serviceKey: '',
    dbPassword: ''
  })
  
  const [isSetupRunning, setIsSetupRunning] = useState(false)
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'validate',
      title: 'Validate Configuration',
      description: 'Checking Supabase credentials',
      status: 'pending'
    },
    {
      id: 'connection',
      title: 'Test Connection',
      description: 'Connecting to Supabase database',
      status: 'pending'
    },
    {
      id: 'env',
      title: 'Update Environment',
      description: 'Saving configuration to .env file',
      status: 'pending'
    },
    {
      id: 'schema',
      title: 'Apply Database Schema',
      description: 'Creating database tables and structure',
      status: 'pending'
    },
    {
      id: 'seed',
      title: 'Seed Initial Data',
      description: 'Adding default settings and sample data',
      status: 'pending'
    }
  ])

  const updateStepStatus = (stepId: string, status: SetupStep['status'], error?: string) => {
    setSetupSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ))
  }

  const handleInputChange = (field: keyof SupabaseConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const validateConfig = () => {
    const errors: string[] = []
    
    if (!config.url || !config.url.startsWith('https://')) {
      errors.push('Supabase URL must start with https://')
    }
    
    if (!config.anonKey || config.anonKey.length < 100) {
      errors.push('Anonymous key appears to be invalid')
    }
    
    if (!config.serviceKey || config.serviceKey.length < 100) {
      errors.push('Service role key appears to be invalid')
    }

    if (!config.dbPassword || config.dbPassword.length < 8) {
      errors.push('Database password must be at least 8 characters')
    }

    return errors
  }

  const runSetup = async () => {
    setIsSetupRunning(true)
    
    try {
      // Step 1: Validate Configuration
      updateStepStatus('validate', 'loading')
      const validationErrors = validateConfig()
      if (validationErrors.length > 0) {
        updateStepStatus('validate', 'error', validationErrors.join(', '))
        return
      }
      updateStepStatus('validate', 'success')
      
      // Step 2: Test Connection
      updateStepStatus('connection', 'loading')
      const connectionResult = await fetch('/api/setup/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (!connectionResult.ok) {
        const error = await connectionResult.text()
        updateStepStatus('connection', 'error', error)
        return
      }
      updateStepStatus('connection', 'success')
      
      // Step 3: Update Environment
      updateStepStatus('env', 'loading')
      const envResult = await fetch('/api/setup/update-env', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (!envResult.ok) {
        const error = await envResult.text()
        updateStepStatus('env', 'error', error)
        return
      }
      updateStepStatus('env', 'success')
      
      // Step 4: Apply Schema
      updateStepStatus('schema', 'loading')
      const schemaResult = await fetch('/api/setup/apply-schema', {
        method: 'POST'
      })
      
      if (!schemaResult.ok) {
        const error = await schemaResult.text()
        updateStepStatus('schema', 'error', error)
        return
      }
      updateStepStatus('schema', 'success')
      
      // Step 5: Seed Data
      updateStepStatus('seed', 'loading')
      const seedResult = await fetch('/api/setup/seed-data', {
        method: 'POST'
      })
      
      if (!seedResult.ok) {
        const error = await seedResult.text()
        updateStepStatus('seed', 'error', error)
        return
      }
      updateStepStatus('seed', 'success')
      
      // Setup complete
      setTimeout(() => {
        onSetupComplete?.()
      }, 1000)
      
    } catch (error) {
      console.error('Setup failed:', error)
    } finally {
      setIsSetupRunning(false)
    }
  }

  const getStepIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
    }
  }

  const isFormValid = config.url && config.anonKey && config.serviceKey
  const hasErrors = setupSteps.some(step => step.status === 'error')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Database className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Supabase Database Setup</CardTitle>
          <CardDescription>
            Configure your Supabase connection to get started with VX10
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isSetupRunning ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Supabase Project URL
                  </Label>
                  <Input
                    id="url"
                    placeholder="https://your-project-ref.supabase.co"
                    value={config.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="anonKey" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Anonymous Key
                  </Label>
                  <Input
                    id="anonKey"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={config.anonKey}
                    onChange={(e) => handleInputChange('anonKey', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="serviceKey" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Service Role Key
                  </Label>
                  <Input
                    id="serviceKey"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={config.serviceKey}
                    onChange={(e) => handleInputChange('serviceKey', e.target.value)}
                  />
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  You can find these credentials in your Supabase project dashboard under Settings → API.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={runSetup} 
                disabled={!isFormValid}
                className="w-full"
              >
                Start Setup
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Setting up your database...</h3>
              
              {setupSteps.map((step) => (
                <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                    {step.error && (
                      <p className="text-sm text-red-600 mt-1">{step.error}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {hasErrors && (
                <Button 
                  onClick={() => {
                    setIsSetupRunning(false)
                    setSetupSteps(prev => prev.map(step => ({ ...step, status: 'pending', error: undefined })))
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
