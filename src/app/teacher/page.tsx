"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { GraduationCap, BookOpen, Users, Calendar, ClipboardList, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TeacherDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/")
      return
    }

    if (session.user.role !== "TEACHER") {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "TEACHER") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Welcome back, {session.user.name || session.user.email}! Manage your classes and students.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Courses you teach
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">100%</div>
            <p className="text-xs text-muted-foreground">
              Student success rate
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common teaching tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link href="/teacher/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Courses
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/teacher/students">
                <Users className="mr-2 h-4 w-4" />
                View Students
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/teacher/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Class Schedule
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/teacher/grades">
                <ClipboardList className="mr-2 h-4 w-4" />
                Grade Assignments
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">System initialized</p>
                  <p className="text-xs text-gray-500">Ready to start teaching</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Teacher account created</p>
                  <p className="text-xs text-gray-500">Welcome to VX10 platform</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Set up your teaching environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Create Your First Course</h3>
                <p className="text-sm text-gray-600 mb-4">Set up course materials and curriculum</p>
                <Button size="sm" variant="outline">Get Started</Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Invite Students</h3>
                <p className="text-sm text-gray-600 mb-4">Add students to your classes</p>
                <Button size="sm" variant="outline">Invite Now</Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Schedule Classes</h3>
                <p className="text-sm text-gray-600 mb-4">Set up your teaching schedule</p>
                <Button size="sm" variant="outline">Schedule</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
