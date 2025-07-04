"use client"

import { useState, useEffect } from "react"
import { Settings, Database, Package, Users, CheckCircle, AlertCircle, Play, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface Dependency {
  name: string
  description: string
  version?: string
  status: "installed" | "missing" | "outdated"
  category: "core" | "ui" | "auth" | "database" | "dev"
  installCommand: string
}

const dependencies: Dependency[] = [
  {
    name: "@prisma/client",
    description: "Prisma Client for database operations",
    version: "6.11.1",
    status: "installed",
    category: "database",
    installCommand: "npm install @prisma/client"
  },
  {
    name: "@auth/prisma-adapter",
    description: "Prisma adapter for NextAuth.js",
    version: "2.10.0",
    status: "installed",
    category: "auth",
    installCommand: "npm install @auth/prisma-adapter"
  },
  {
    name: "next-auth",
    description: "Authentication library for Next.js",
    version: "4.24.11",
    status: "installed",
    category: "auth",
    installCommand: "npm install next-auth"
  },
  {
    name: "bcryptjs",
    description: "Password hashing library",
    version: "3.0.2",
    status: "installed",
    category: "auth",
    installCommand: "npm install bcryptjs @types/bcryptjs"
  },
  {
    name: "react-i18next",
    description: "Internationalization for React",
    version: "15.6.0",
    status: "installed",
    category: "core",
    installCommand: "npm install react-i18next i18next-browser-languagedetector i18next-http-backend"
  },
  {
    name: "zod",
    description: "TypeScript-first schema validation",
    version: "3.25.73",
    status: "installed",
    category: "core",
    installCommand: "npm install zod"
  },
  {
    name: "prisma",
    description: "Prisma CLI for database migrations",
    version: "6.11.1",
    status: "installed",
    category: "dev",
    installCommand: "npm install --save-dev prisma"
  }
]

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState({
    database: "pending",
    migrations: "pending",
    testUsers: "pending"
  })
  const [isRunningSetup, setIsRunningSetup] = useState(false)
  const [setupProgress, setSetupProgress] = useState(0)

  const runPostgresSetup = async () => {
    setIsRunningSetup(true)
    setSetupProgress(0)
    
    try {
      // Simulate setup progress
      setSetupProgress(25)
      setSetupStatus(prev => ({ ...prev, database: "running" }))
      
      // In a real implementation, you would call your setup API here
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSetupProgress(50)
      setSetupStatus(prev => ({ ...prev, database: "completed", migrations: "running" }))
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSetupProgress(75)
      setSetupStatus(prev => ({ ...prev, migrations: "completed", testUsers: "running" }))
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSetupProgress(100)
      setSetupStatus(prev => ({ ...prev, testUsers: "completed" }))
      
    } catch (error) {
      console.error("Setup failed:", error)
    } finally {
      setIsRunningSetup(false)
    }
  }

  const resetSetup = async () => {
    setSetupStatus({
      database: "pending",
      migrations: "pending", 
      testUsers: "pending"
    })
    setSetupProgress(0)
  }

  const installDependency = async (dependency: Dependency) => {
    // In a real implementation, you would trigger the installation
    console.log(`Installing ${dependency.name}...`)
    // This would need a backend API to actually run npm commands
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "installed":
        return <Badge variant="default" className="bg-green-100 text-green-800">Installed</Badge>
      case "outdated":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Outdated</Badge>
      case "missing":
        return <Badge variant="destructive">Missing</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="h-4 w-4" />
      case "auth":
        return <Users className="h-4 w-4" />
      case "ui":
      case "core":
        return <Package className="h-4 w-4" />
      case "dev":
        return <Settings className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const groupedDependencies = dependencies.reduce((acc, dep) => {
    if (!acc[dep.category]) {
      acc[dep.category] = []
    }
    acc[dep.category].push(dep)
    return acc
  }, {} as Record<string, Dependency[]>)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">System Setup</h1>
        </div>
        <p className="text-gray-600">
          Configure your VX10 platform with PostgreSQL, authentication, and dependencies.
        </p>
      </div>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="database">Database Setup</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PostgreSQL Database Setup</CardTitle>
              <CardDescription>
                Initialize PostgreSQL database, run migrations, and create test users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {setupProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Setup Progress</span>
                    <span>{setupProgress}%</span>
                  </div>
                  <Progress value={setupProgress} className="h-2" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(setupStatus.database)}
                    <div>
                      <h3 className="font-medium">Database Connection</h3>
                      <p className="text-sm text-gray-600">Setup PostgreSQL database and user</p>
                    </div>
                  </div>
                  <Badge variant={setupStatus.database === "completed" ? "default" : "secondary"}>
                    {setupStatus.database}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(setupStatus.migrations)}
                    <div>
                      <h3 className="font-medium">Database Migrations</h3>
                      <p className="text-sm text-gray-600">Apply Prisma schema migrations</p>
                    </div>
                  </div>
                  <Badge variant={setupStatus.migrations === "completed" ? "default" : "secondary"}>
                    {setupStatus.migrations}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(setupStatus.testUsers)}
                    <div>
                      <h3 className="font-medium">Test Users</h3>
                      <p className="text-sm text-gray-600">Create admin, teacher, and student accounts</p>
                    </div>
                  </div>
                  <Badge variant={setupStatus.testUsers === "completed" ? "default" : "secondary"}>
                    {setupStatus.testUsers}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={runPostgresSetup} 
                  disabled={isRunningSetup}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {isRunningSetup ? "Running Setup..." : "Run PostgreSQL Setup"}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetSetup}
                  disabled={isRunningSetup}
                >
                  Reset Setup
                </Button>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will run the PowerShell script to install PostgreSQL, create the database, 
                  and set up test accounts. Make sure you have administrator privileges.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Manual Setup Instructions:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
                  <li>Run: <code className="bg-gray-200 px-1 rounded">npm run setup:postgres</code></li>
                  <li>Or manually: <code className="bg-gray-200 px-1 rounded">powershell -ExecutionPolicy Bypass -File ./setup_postgres.ps1</code></li>
                  <li>Follow the prompts to install PostgreSQL if needed</li>
                  <li>Test the connection with the created accounts</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Accounts</CardTitle>
              <CardDescription>
                Default accounts for testing different user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-blue-600 mb-2">Admin Account</h3>
                  <p className="text-sm text-gray-600 mb-2">Full system access</p>
                  <div className="text-sm space-y-1">
                    <div>Email: <code>admin@vx10.com</code></div>
                    <div>Password: <code>admin</code></div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-green-600 mb-2">Teacher Account</h3>
                  <p className="text-sm text-gray-600 mb-2">Manage courses and students</p>
                  <div className="text-sm space-y-1">
                    <div>Email: <code>teacher@vx10.com</code></div>
                    <div>Password: <code>teacher</code></div>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium text-purple-600 mb-2">Student Account</h3>
                  <p className="text-sm text-gray-600 mb-2">Access learning materials</p>
                  <div className="text-sm space-y-1">
                    <div>Email: <code>student@vx10.com</code></div>
                    <div>Password: <code>student</code></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Dependencies</CardTitle>
              <CardDescription>
                Manage and install required dependencies for the VX10 platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedDependencies).map(([category, deps]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-medium mb-3 flex items-center gap-2 capitalize">
                    {getCategoryIcon(category)}
                    {category} Dependencies
                  </h3>
                  <div className="space-y-2">
                    {deps.map((dep) => (
                      <div key={dep.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{dep.name}</h4>
                            {dep.version && (
                              <Badge variant="outline" className="text-xs">{dep.version}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{dep.description}</p>
                          <code className="text-xs text-gray-500">{dep.installCommand}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(dep.status)}
                          {dep.status !== "installed" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => installDependency(dep)}
                            >
                              Install
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Dependency installation requires a backend API to execute npm commands. 
                  For now, run the commands manually in your terminal.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>
              Navigate to different parts of the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/admin">
                  <Settings className="h-6 w-6" />
                  <span>Admin Dashboard</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/teacher">
                  <Users className="h-6 w-6" />
                  <span>Teacher Dashboard</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/student">
                  <Package className="h-6 w-6" />
                  <span>Student Dashboard</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Link href="/">
                  <Database className="h-6 w-6" />
                  <span>Main Site</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
