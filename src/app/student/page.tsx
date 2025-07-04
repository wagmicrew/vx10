"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { BookOpen, Award, Calendar, Clock, Target, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push("/")
      return
    }

    if (session.user.role !== "STUDENT") {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "STUDENT") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        </div>
        <p className="text-gray-600">
          Welcome back, {session.user.name || session.user.email}! Continue your learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Ready to enroll
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Courses finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">--</div>
            <p className="text-xs text-muted-foreground">
              Overall performance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Progress</CardTitle>
            <CardDescription>
              Your current learning progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Welcome Course</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            <p className="text-sm text-gray-500 text-center py-4">
              No courses enrolled yet. Start your learning journey!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common student activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start">
              <Link href="/student/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/student/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                My Schedule
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/student/grades">
                <Award className="mr-2 h-4 w-4" />
                View Grades
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/student/profile">
                <Target className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest learning activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Account created</p>
                  <p className="text-xs text-gray-500">Welcome to VX10 learning platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Profile setup complete</p>
                  <p className="text-xs text-gray-500">Ready to start learning</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Goals</CardTitle>
            <CardDescription>
              Set and track your learning objectives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No goals set yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Set learning goals to track your progress
                </p>
                <Button size="sm">Set Your First Goal</Button>
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
              Welcome to your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Explore Courses</h3>
                <p className="text-sm text-gray-600 mb-4">Discover available courses and enroll</p>
                <Button size="sm" variant="outline">Browse Now</Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Plan Your Schedule</h3>
                <p className="text-sm text-gray-600 mb-4">Organize your study time effectively</p>
                <Button size="sm" variant="outline">Create Schedule</Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-medium mb-2">Set Learning Goals</h3>
                <p className="text-sm text-gray-600 mb-4">Track your progress and achievements</p>
                <Button size="sm" variant="outline">Set Goals</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
