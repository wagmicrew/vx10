"use client"

import { Button } from "@/components/ui/preline-button"
import { Card, CardHeader, CardTitle, CardContent, InteractiveCard, RedCard } from "@/components/ui/preline-card"
import { Input, FloatingInput } from "@/components/ui/preline-input"
import { Badge, DotBadge } from "@/components/ui/preline-badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/preline-alert"

export default function TestPrelinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Preline UI Components Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing the red/black themed Preline components with Tailwind 4
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="white">White</Button>
              <Button variant="tonal">Tonal</Button>
              <Button variant="danger">Danger</Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This is a standard Preline card component.
              </p>
            </CardContent>
          </Card>

          <InteractiveCard>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This card has hover effects. Try hovering over it!
              </p>
            </CardContent>
          </InteractiveCard>

          <RedCard>
            <CardHeader>
              <CardTitle>Red Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                This card uses the red theme colors.
              </p>
            </CardContent>
          </RedCard>
        </div>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input label="Standard Input" placeholder="Enter text..." />
                <Input label="Email Input" type="email" placeholder="your@email.com" />
                <Input 
                  label="Error Input" 
                  error="This field is required" 
                  placeholder="Input with error"
                />
                <Input 
                  label="Success Input" 
                  variant="success"
                  helperText="This input is valid"
                  placeholder="Valid input"
                />
              </div>
              <div className="space-y-4">
                <FloatingInput label="Floating Label" placeholder="Floating Label" />
                <FloatingInput label="Floating Email" type="email" placeholder="Floating Email" />
                <FloatingInput label="Floating Password" type="password" placeholder="Floating Password" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badge Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="dark">Dark</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Outline</Badge>
                <Badge variant="outline-primary">Outline Primary</Badge>
                <Badge variant="primary" removable onRemove={() => alert('Badge removed!')}>
                  Removable
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <DotBadge variant="primary" />
                  <span className="text-sm">Primary notification</span>
                </div>
                <div className="flex items-center gap-2">
                  <DotBadge variant="success" />
                  <span className="text-sm">Success notification</span>
                </div>
                <div className="flex items-center gap-2">
                  <DotBadge variant="danger" />
                  <span className="text-sm">Danger notification</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <div className="space-y-4">
          <Alert variant="primary">
            <AlertTitle>Primary Alert</AlertTitle>
            <AlertDescription>
              This is a primary alert with the red theme.
            </AlertDescription>
          </Alert>

          <Alert variant="success" dismissible onDismiss={() => alert('Alert dismissed!')}>
            <AlertTitle>Success Alert</AlertTitle>
            <AlertDescription>
              This is a dismissible success alert. Click the X to dismiss.
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTitle>Warning Alert</AlertTitle>
            <AlertDescription>
              This is a warning alert to grab attention.
            </AlertDescription>
          </Alert>

          <Alert variant="danger">
            <AlertTitle>Danger Alert</AlertTitle>
            <AlertDescription>
              This is a danger alert for critical information.
            </AlertDescription>
          </Alert>
        </div>

        {/* Form Example */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Form Example</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingInput label="First Name" required />
                <FloatingInput label="Last Name" required />
              </div>
              <FloatingInput label="Email Address" type="email" required />
              <FloatingInput label="Phone Number" type="tel" />
              <div className="flex items-center gap-4">
                <Badge variant="primary">VIP Customer</Badge>
                <DotBadge variant="success" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Account Active</span>
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="primary" className="flex-1">
                  Submit Form
                </Button>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
