"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const router = useRouter()

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Fel e-postadress eller lösenord")
      } else {
        // Get the updated session to access user role
        const session = await getSession()
        
        if (session?.user?.role) {
          // Redirect based on user role
          switch (session.user.role) {
            case "ADMIN":
              router.push("/admin")
              break
            case "TEACHER":
              router.push("/teacher")
              break
            case "STUDENT":
              router.push("/student")
              break
            default:
              // Fallback to student dashboard for unknown roles
              router.push("/student")
          }
        } else {
          // Fallback if no role is found
          router.push("/student")
        }
      }
    } catch {
      setError("Ett fel inträffade vid inloggning")
    }

    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Lösenorden matchar inte")
      setLoading(false)
      return
    }

    if (registerForm.password.length < 6) {
      setError("Lösenordet måste vara minst 6 tecken")
      setLoading(false)
      return
    }

    try {
      // Call your registration API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
          name: registerForm.fullName
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError("Fel vid registrering: " + (data.error || 'Okänt fel'))
      } else {
        setSuccess("Registrering lyckades! Du kan nu logga in.")
        setRegisterForm({ email: "", password: "", confirmPassword: "", fullName: "" })
      }
    } catch {
      setError("Ett fel inträffade vid registrering")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/din-logo.png" alt="Din Trafikskola Hässleholm" width={80} height={80} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Din Trafikskola Hässleholm</h1>
          <p className="text-gray-600">Logga in eller skapa ett konto</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">Välkommen</CardTitle>
            <CardDescription className="text-center">Hantera dina körlektioner och betalningar</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Logga in</TabsTrigger>
                <TabsTrigger value="register">Registrera</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-postadress</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="din@email.se"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ditt lösenord"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                    {loading ? "Loggar in..." : "Logga in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Fullständigt namn</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Ditt fullständiga namn"
                        value={registerForm.fullName}
                        onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-postadress</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="din@email.se"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minst 6 tecken"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Bekräfta lösenord</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Upprepa lösenordet"
                        value={registerForm.confirmPassword}
                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                    {loading ? "Registrerar..." : "Skapa konto"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Behöver du hjälp? Ring oss på{" "}
            <a href="tel:0760389192" className="text-red-600 hover:underline">
              0760-389192
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
