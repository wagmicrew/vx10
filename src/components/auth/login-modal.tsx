"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { LogIn, User, Lock, X } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Card,
  CardContent
} from "@mui/material"
import { BorderBeam } from "@/components/magicui/border-beam"
import { toast } from "sonner"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid credentials")
      } else {
        toast.success("Logged in successfully")
        onClose()
        // Refresh the page to update the session
        window.location.reload()
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          overflow: 'visible',
          background: 'transparent',
          boxShadow: 'none',
        },
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        {/* Glassmorphism Container */}
        <Box
          sx={{
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            overflow: 'hidden',
          }}
        >
          {/* MagicUI BorderBeam */}
          <BorderBeam
            size={60}
            duration={12}
            delay={9}
            colorFrom="#dc2626"
            colorTo="#ef4444"
            className="rounded-2xl"
          />
          
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <LogIn size={16} />
              </Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Login to VX10
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                width: 32,
                height: 32,
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              <X size={16} />
            </IconButton>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: 3 }}>
            <Card
              sx={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: 'none',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      name="email"
                      type="email"
                      label="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <User size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                          </InputAdornment>
                        ),
                        sx: {
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.4)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(239,68,68,0.8)',
                          },
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        },
                      }}
                      InputLabelProps={{
                        sx: {
                          color: 'rgba(255,255,255,0.9)',
                          '&.Mui-focused': {
                            color: 'rgba(239,68,68,0.9)',
                          },
                        },
                      }}
                      placeholder="Enter your email"
                    />

                    <TextField
                      name="password"
                      type="password"
                      label="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      disabled={isLoading}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                          </InputAdornment>
                        ),
                        sx: {
                          color: 'white',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.2)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(255,255,255,0.4)',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(239,68,68,0.8)',
                          },
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                        },
                      }}
                      InputLabelProps={{
                        sx: {
                          color: 'rgba(255,255,255,0.9)',
                          '&.Mui-focused': {
                            color: 'rgba(239,68,68,0.9)',
                          },
                        },
                      }}
                      placeholder="Enter your password"
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                        color: 'white',
                        fontWeight: 600,
                        py: 1.5,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '16px',
                        boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                          boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
                        },
                        '&:disabled': {
                          background: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.5)',
                        },
                      }}
                    >
                      {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>

            {/* Test Accounts Section */}
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  fontWeight: 500,
                  mb: 1.5
                }}
              >
                Test Accounts:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                  Admin: admin@vx10.com / admin
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                  Teacher: teacher@vx10.com / teacher
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                  Student: student@vx10.com / student
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
