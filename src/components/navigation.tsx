"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  styled,
  Button as MuiButton,
  Paper,
} from "@mui/material"
import { ContactForm } from "@/components/contact-form"
import { LoginModal } from "@/components/auth/login-modal"
import {
  Home,
  Info,
  Handshake,
  MapPin as LocationIcon,
  Calendar,
  Mail,
  LogIn,
  LogOut,
  Settings,
  User,
  Phone,
  MapPin,
  Menu,
  X,
} from "lucide-react"

// Styled navigation item component
const NavItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 3),
  margin: theme.spacing(0, 0.5),
  borderRadius: theme.spacing(1),
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  color: 'white',
  textDecoration: 'none',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    borderRadius: theme.spacing(1),
    opacity: 0,
    transition: 'opacity 0.3s ease',
    zIndex: 1,
  },
  
  '&:hover::before': {
    opacity: 1,
  },
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  
  '&.active': {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '70%',
      height: '3px',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
      borderRadius: '2px 2px 0 0',
    },
  },
  
  '& .nav-icon': {
    marginRight: theme.spacing(1.5),
    fontSize: '1.2rem',
    zIndex: 2,
    position: 'relative',
  },
  
  '& .nav-text': {
    fontWeight: 500,
    fontSize: '0.95rem',
    zIndex: 2,
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(1.25, 2),
    '& .nav-text': {
      fontSize: '0.9rem',
    },
  },
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1, 1.5),
    '& .nav-text': {
      display: 'none',
    },
    '& .nav-icon': {
      marginRight: 0,
    },
  },
}))

// Static menu items (no database dependency)
const menuItems = [
  { 
    id: 1, 
    title: "Hem", 
    slug: "hem", 
    url: "/", 
    icon: Home,
    hasDropdown: false
  },
  { 
    id: 2, 
    title: "Om oss", 
    slug: "om-oss", 
    url: "/om-oss", 
    icon: Info,
    hasDropdown: false
  },
  { 
    id: 3, 
    title: "Våra Tjänster", 
    slug: "vara-tjanster", 
    url: "/vara-tjanster", 
    icon: Handshake,
    hasDropdown: true,
    dropdownItems: [
      { title: "B-körkort", url: "/vara-tjanster#b-korkort" },
      { title: "Taxiförarlegitimation", url: "/vara-tjanster#taxi" },
      { title: "Övriga behörigheter", url: "/vara-tjanster#ovriga" },
    ]
  },
  { 
    id: 4, 
    title: "Lokalerna", 
    slug: "lokalerna", 
    url: "/lokalerna", 
    icon: LocationIcon,
    hasDropdown: false
  },
  { 
    id: 5, 
    title: "Boka körning", 
    slug: "boka-korning", 
    url: "/boka-korning", 
    icon: Calendar,
    hasDropdown: false
  },
]

export function Navigation() {
  const [showContactForm, setShowContactForm] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Fix hydration mismatch by mounting client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        {/* Server-side placeholder header - simplified to match exactly */}
        <header className="bg-black text-white py-4 px-6 relative z-50 shadow-lg" suppressHydrationWarning>
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-4">
              <Image
                src="/images/din-logo.png"
                alt="Din Trafikskola Hässleholm"
                className="h-12 sm:h-14 md:h-16 lg:h-18 w-auto"
                width={72}
                height={72}
                priority
              />
              <div className="flex flex-col">
                <h1 className="text-red-600 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight">
                  Trafikskola
                </h1>
                <div className="text-red-600 text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-tight ml-6 sm:ml-8 md:ml-10 lg:ml-12 italic">
                  Hässleholm
                </div>
              </div>
            </Link>
          </div>
        </header>
        {/* Static navigation placeholder */}
        <div className="hidden md:block bg-white border-b border-gray-200 h-16" suppressHydrationWarning />
      </>
    )
  }

  const getDashboardUrl = () => {
    if (!session?.user?.role) return "/"
    switch (session.user.role) {
      case "ADMIN":
        return "/admin"
      case "TEACHER":
        return "/teacher"
      case "STUDENT":
        return "/student"
      default:
        return "/"
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <>
      {/* Header */}
      <header className="bg-black text-white py-4 px-6 relative z-50 shadow-lg" suppressHydrationWarning>
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo with custom text */}
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <Image
              src="/images/din-logo.png"
              alt="Din Trafikskola Hässleholm - Körkort och körkortsutbildning"
              className="h-12 sm:h-14 md:h-16 lg:h-18 w-auto"
              width={72}
              height={72}
              sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, (max-width: 1024px) 64px, 72px"
              priority
            />
            <div className="flex flex-col">
              <h1
                className="text-red-600 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight"
                style={{ fontFamily: 'Didot, Bodoni, "Playfair Display", serif' }}
              >
                Trafikskola
              </h1>
              <div
                className="text-red-600 text-sm sm:text-base md:text-lg lg:text-xl font-normal leading-tight ml-6 sm:ml-8 md:ml-10 lg:ml-12 italic"
                style={{ fontFamily: 'Didot, Bodoni, "Playfair Display", serif' }}
              >
                Hässleholm
              </div>
            </div>
          </Link>

          {/* Desktop Contact info */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>Östergatan 3a, 281 30 Hässleholm</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-red-500" />
              <span>0760-389192</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-red-500" />
              <span>info@dintrafikskolahlm.se</span>
            </div>
          </div>

          {/* Mobile contact and menu */}
          <Box sx={{ display: { lg: 'none' }, alignItems: 'center', gap: 2 }}>
            <IconButton
              component="a"
              href="tel:0760389192"
              sx={{ color: '#ef4444', '&:hover': { color: '#f87171' } }}
              aria-label="Ring Din Trafikskola Hässleholm på 0760-389192"
            >
              <Phone size={16} />
            </IconButton>
            <Typography 
              component="a" 
              href="tel:0760389192" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                color: '#ef4444',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: '#f87171' }
              }}
            >
              0760-389192
            </Typography>
            <IconButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              sx={{ color: 'white', '&:hover': { color: '#f87171' } }}
              aria-label="Öppna meny"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </Box>
        </div>
      </header>

      {/* Modern Material UI Navigation */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
          zIndex: 40,
          display: { xs: 'none', md: 'block' },
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar 
          sx={{ 
            justifyContent: 'center', 
            py: 1,
            px: { md: 2, lg: 3 },
            minHeight: '70px !important',
            maxWidth: '100%',
          }}
        >
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'nowrap',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '1400px'
            }}
          >
            {/* Navigation Items */}
            {menuItems.map((item) => {
              const IconComponent = item.icon
              const isActive = pathname === item.url
              
              return (
                <Link key={item.id} href={item.url} style={{ textDecoration: 'none' }}>
                  <NavItem
                    className={isActive ? 'active' : ''}
                    sx={{ textDecoration: 'none' }}
                  >
                    <IconComponent className="nav-icon" size={20} />
                    <Typography className="nav-text">
                      {item.title}
                    </Typography>
                  </NavItem>
                </Link>
              )
            })}
            
            {/* Contact Button */}
            <NavItem
              onClick={() => setShowContactForm(true)}
              sx={{ cursor: 'pointer' }}
            >
              <Mail className="nav-icon" size={20} />
              <Typography className="nav-text">
                Kontakta oss
              </Typography>
            </NavItem>
            
            {/* Authentication */}
            <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
              {status === "loading" ? (
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }} />
                </Box>
              ) : session ? (
                <>
                  <IconButton
                    onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                    sx={{ 
                      p: 0,
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40, 
                        bgcolor: 'rgba(255,255,255,0.9)',
                        color: '#dc2626',
                        fontWeight: 600,
                        fontSize: '1.1rem'
                      }}
                    >
                      {session.user.name?.[0] || session.user.email?.[0] || "U"}
                    </Avatar>
                  </IconButton>
                  <MuiMenu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={() => setUserMenuAnchor(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    sx={{
                      '& .MuiPaper-root': {
                        minWidth: 220,
                        mt: 1,
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" fontWeight={600}>
                        {session.user.name || "User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.user.email}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip 
                          label={session.user.role} 
                          size="small" 
                          sx={{
                            bgcolor: '#dc2626',
                            color: 'white',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Box>
                    <MenuItem 
                      component={Link} 
                      href={getDashboardUrl()}
                      onClick={() => setUserMenuAnchor(null)}
                    >
                      <ListItemIcon>
                        <User size={18} />
                      </ListItemIcon>
                      <ListItemText>Dashboard</ListItemText>
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      href="/setup"
                      onClick={() => setUserMenuAnchor(null)}
                    >
                      <ListItemIcon>
                        <Settings size={18} />
                      </ListItemIcon>
                      <ListItemText>Setup</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem 
                      onClick={() => {
                        handleLogout()
                        setUserMenuAnchor(null)
                      }}
                      sx={{ color: '#dc2626' }}
                    >
                      <ListItemIcon>
                        <LogOut size={18} color="#dc2626" />
                      </ListItemIcon>
                      <ListItemText>Logga ut</ListItemText>
                    </MenuItem>
                  </MuiMenu>
                </>
              ) : (
                <NavItem
                  onClick={() => setShowLoginModal(true)}
                  sx={{ cursor: 'pointer', ml: 1 }}
                >
                  <LogIn className="nav-icon" size={20} />
                  <Typography className="nav-text">
                    Inloggning
                  </Typography>
                </NavItem>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Material UI Mobile Navigation */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: { xs: '85vw', sm: 320 },
            maxWidth: 320,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        {/* Drawer Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            color: 'white',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Image 
              src="/images/din-logo-small.png" 
              alt="Din Trafikskola" 
              width={32} 
              height={32} 
              style={{ borderRadius: '4px' }}
            />
            <Typography variant="h6" fontWeight={600}>
              Meny
            </Typography>
          </Box>
          <IconButton
            onClick={() => setMobileMenuOpen(false)}
            sx={{ 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
            }}
            aria-label="Stäng meny"
          >
            <X size={20} />
          </IconButton>
        </Box>

        {/* Navigation Items */}
        <List sx={{ py: 0, flex: 1 }}>
          {menuItems.map((item) => {
            const IconComponent = item.icon
            const isActive = pathname === item.url
            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{
                    py: 2,
                    px: 3,
                    borderRight: isActive ? '4px solid #dc2626' : 'none',
                    bgcolor: isActive ? 'rgba(220, 38, 38, 0.05)' : 'transparent',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(220, 38, 38, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    },
                    '&:active': {
                      bgcolor: 'rgba(220, 38, 38, 0.12)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <IconComponent 
                      size={20} 
                      color={isActive ? '#dc2626' : '#6b7280'} 
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#dc2626' : '#374151',
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
          
          {/* Contact Button */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                setShowContactForm(true)
                setMobileMenuOpen(false)
              }}
              sx={{
                py: 2,
                px: 3,
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Mail size={20} color="#6b7280" />
              </ListItemIcon>
              <ListItemText 
                primary="Kontakt"
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: 500,
                    color: '#374151',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
          
          {/* Authentication */}
          {session ? (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  href={getDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <User size={20} color="#6b7280" />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LogOut size={20} color="#dc2626" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logga ut" 
                    sx={{ '& .MuiListItemText-primary': { color: '#dc2626' } }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    setShowLoginModal(true)
                    setMobileMenuOpen(false)
                  }}
                  sx={{ py: 2, px: 3 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <LogIn size={20} color="#dc2626" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Logga in" 
                    sx={{ '& .MuiListItemText-primary': { color: '#dc2626', fontWeight: 500 } }}
                  />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>

        {/* Drawer Footer */}
        <Box
          sx={{
            p: 3,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            bgcolor: 'rgba(249, 250, 251, 0.8)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography
              component="a"
              href="tel:0760389192"
              sx={{
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '1.125rem',
                textDecoration: 'none',
                '&:hover': { color: '#b91c1c' },
              }}
            >
              📞 0760-389192
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" align="center">
            Östergatan 3a, Hässleholm
          </Typography>
        </Box>
      </Drawer>

      {/* Mobile Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          display: { xs: 'block', md: 'none' },
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          pb: 'env(safe-area-inset-bottom)',
        }}
        elevation={8}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', height: 80 }}>
          {menuItems.slice(0, 4).map((item) => {
            const IconComponent = item.icon
            const isActive = pathname === item.url
            return (
              <Box
                key={item.id}
                component={Link}
                href={item.url}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  color: isActive ? '#dc2626' : '#6b7280',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  '&:active': {
                    color: '#dc2626',
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <IconComponent size={20} />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.75rem',
                  }}
                >
                  {item.title.split(" ")[0]}
                </Typography>
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 4,
                      bgcolor: '#dc2626',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </Box>
            )
          })}
        </Box>
      </Paper>

      {/* Spacer for mobile bottom navigation */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, height: 80 }} />

      {/* Contact Form Modal */}
      <ContactForm isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
      
      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
