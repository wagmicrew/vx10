"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment
} from "@mui/material"
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye,
  EyeOff,
  Chrome,
  Github
} from "lucide-react"
import { GlassmorphismPopup } from "@/components/ui/glassmorphism-popup"

interface MUILoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MUILoginModal({ isOpen, onClose }: MUILoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials. Please try again.")
      } else {
        onClose()
        // Optionally redirect or refresh
        window.location.reload()
      }
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true)
    setError("")
    
    try {
      await signIn(provider, { callbackUrl: "/" })
    } catch {
      setError("Social login failed. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <GlassmorphismPopup
      isOpen={isOpen}
      onClose={onClose}
      title="Welcome Back"
      icon={<LogIn className="h-5 w-5" />}
      maxWidth="sm"
    >
      <Box sx={{ p: 2 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              borderColor: 'rgba(220, 38, 38, 0.2)',
              color: 'white',
              '& .MuiAlert-icon': {
                color: '#fca5a5'
              }
            }}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail className="h-4 w-4 text-white/70" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: 'rgba(239, 68, 68, 0.9)',
                  },
                },
                '& input': {
                  color: 'white',
                },
                '& input::placeholder': {
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock className="h-4 w-4 text-white/70" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: 'rgba(239, 68, 68, 0.9)',
                  },
                },
                '& input': {
                  color: 'white',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                mt: 2,
                py: 1.5,
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(220, 38, 38, 0.9)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(220, 38, 38, 0.25)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(107, 114, 128, 0.5)',
                  color: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} sx={{ color: 'white' }} />
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </form>

        <Divider 
          sx={{ 
            my: 3, 
            borderColor: 'rgba(255, 255, 255, 0.2)',
            '&::before, &::after': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', px: 2 }}>
            or continue with
          </Typography>
        </Divider>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
            startIcon={<Chrome className="h-4 w-4" />}
            sx={{
              py: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => handleSocialLogin("github")}
            disabled={isLoading}
            startIcon={<Github className="h-4 w-4" />}
            sx={{
              py: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            GitHub
          </Button>
        </Box>

        <Typography 
          variant="body2" 
          sx={{ 
            mt: 3, 
            textAlign: 'center', 
            color: 'rgba(255, 255, 255, 0.7)' 
          }}
        >
          Don&apos;t have an account?{' '}
          <Button
            variant="text"
            sx={{ 
              color: 'rgba(239, 68, 68, 0.9)', 
              textDecoration: 'underline',
              p: 0,
              minWidth: 'auto',
              '&:hover': {
                backgroundColor: 'transparent',
                textDecoration: 'underline',
              }
            }}
          >
            Sign up here
          </Button>
        </Typography>
      </Box>
    </GlassmorphismPopup>
  )
}
