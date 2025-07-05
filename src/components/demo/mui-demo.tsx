"use client"

import { useState } from "react"
import { Box, Typography, Divider } from "@mui/material"
import { 
  Save, 
  Download, 
  Settings, 
  User, 
  Mail,
  Filter
} from "lucide-react"
import {
  EnhancedButton,
  EnhancedIconButton,
  EnhancedTextField,
  PasswordField,
  SearchField,
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardContent,
  EnhancedCardActions,
  GlassmorphismPopup
} from "@/components/ui"

export function MUIDemo() {
  const [showGlassModal, setShowGlassModal] = useState(false)

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        MUI Components Demo
      </Typography>

      {/* Button Variants */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Button Variants
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <EnhancedButton variant="solid" leftIcon={<Save className="h-4 w-4" />}>
            Save (Solid)
          </EnhancedButton>
          <EnhancedButton variant="glass" leftIcon={<Download className="h-4 w-4" />}>
            Download (Glass)
          </EnhancedButton>
          <EnhancedButton variant="outlined" leftIcon={<Settings className="h-4 w-4" />}>
            Settings (Outlined)
          </EnhancedButton>
          <EnhancedButton variant="text">
            Cancel (Text)
          </EnhancedButton>
        </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <EnhancedIconButton variant="glass">
            <Settings className="h-5 w-5" />
          </EnhancedIconButton>
          <EnhancedIconButton variant="solid">
            <User className="h-5 w-5" />
          </EnhancedIconButton>
          <EnhancedIconButton variant="outlined">
            <Filter className="h-5 w-5" />
          </EnhancedIconButton>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Input Variants */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Input Variants
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 400 }}>
          <EnhancedTextField
            variant="solid"
            label="Name"
            startIcon={<User className="h-4 w-4" />}
            placeholder="Enter your name"
          />
          <EnhancedTextField
            variant="glass"
            label="Email (Glass)"
            startIcon={<Mail className="h-4 w-4" />}
            placeholder="Enter your email"
          />
          <PasswordField
            variant="glass"
            label="Password (Glass)"
            placeholder="Enter password"
            showPasswordToggle
          />
          <SearchField
            variant="outlined"
            label="Search"
            placeholder="Search something..."
          />
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Card Examples */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Card Variants
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 3 }}>
          <EnhancedCard variant="solid">
            <EnhancedCardHeader
              title="Solid Card"
              subtitle="Standard Material UI styling"
              icon={<Settings className="h-5 w-5" />}
            />
            <EnhancedCardContent>
              <Typography variant="body2">
                This card uses the standard Material UI styling with the custom theme colors.
              </Typography>
            </EnhancedCardContent>
            <EnhancedCardActions>
              <EnhancedButton variant="outlined" size="small">
                Cancel
              </EnhancedButton>
              <EnhancedButton variant="solid" size="small">
                Save
              </EnhancedButton>
            </EnhancedCardActions>
          </EnhancedCard>

          <EnhancedCard variant="glass">
            <EnhancedCardHeader
              title="Glass Card"
              subtitle="Glassmorphism styling"
              icon={<User className="h-5 w-5" />}
            />
            <EnhancedCardContent>
              <Typography variant="body2">
                This card uses glassmorphism styling with backdrop blur and transparency effects.
              </Typography>
            </EnhancedCardContent>
            <EnhancedCardActions>
              <EnhancedButton variant="glass" size="small">
                Glass Action
              </EnhancedButton>
            </EnhancedCardActions>
          </EnhancedCard>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Glassmorphism Modal Demo */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Glassmorphism Modal with BorderBeam
        </Typography>
        <EnhancedButton 
          variant="solid" 
          onClick={() => setShowGlassModal(true)}
          leftIcon={<Settings className="h-4 w-4" />}
        >
          Open Glass Modal
        </EnhancedButton>

        <GlassmorphismPopup
          isOpen={showGlassModal}
          onClose={() => setShowGlassModal(false)}
          title="Settings Modal"
          icon={<Settings className="h-5 w-5" />}
          maxWidth="md"
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, color: "white" }}>
              Modal with MUI Components
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <EnhancedTextField
                variant="glass"
                label="Setting Name"
                startIcon={<Settings className="h-4 w-4" />}
                fullWidth
              />
              
              <EnhancedTextField
                variant="glass"
                label="Setting Value"
                startIcon={<User className="h-4 w-4" />}
                fullWidth
              />
              
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <EnhancedButton 
                  variant="glass" 
                  onClick={() => setShowGlassModal(false)}
                >
                  Cancel
                </EnhancedButton>
                <EnhancedButton 
                  variant="solid" 
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Settings
                </EnhancedButton>
              </Box>
            </Box>
          </Box>
        </GlassmorphismPopup>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Migration Guide */}
      <Box>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Migration Guide
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          To migrate from ShadCN to MUI components:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <li>Replace <code>Button</code> with <code>EnhancedButton</code></li>
          <li>Replace <code>Input</code> with <code>EnhancedTextField</code></li>
          <li>Replace <code>Card</code> components with <code>EnhancedCard</code> variants</li>
          <li>Use <code>variant=&quot;glass&quot;</code> for glassmorphism effects</li>
          <li>Keep <code>GlassmorphismPopup</code> for modals with BorderBeam</li>
        </Box>
      </Box>
    </Box>
  )
}
