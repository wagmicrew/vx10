"use client"

import { Paper, Box, Typography, alpha } from '@mui/material'
import Image from 'next/image'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface BentoGridProps {
  children: ReactNode
  className?: string
}

interface BentoGridItemProps {
  className?: string
  title?: string
  description?: string
  header?: ReactNode
  icon?: ReactNode
  children?: ReactNode
  imageSrc?: string
  imageAlt?: string
  onClick?: () => void
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <Box
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </Box>
  )
}

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  children,
  imageSrc,
  imageAlt,
  onClick,
}: BentoGridItemProps) => {
  return (
    <Paper
      onClick={onClick}
      elevation={2}
      sx={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 3,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(220, 38, 38, 0.2)',
        } : {},
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      className={cn(
        "row-span-1 relative group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none justify-between flex flex-col space-y-4",
        className
      )}
    >
      {/* Header with optional image */}
      {(header || imageSrc) && (
        <Box sx={{ position: 'relative', height: '40%', overflow: 'hidden' }}>
          {imageSrc ? (
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <Image
                src={imageSrc}
                alt={imageAlt || title || 'Bento grid image'}
                fill
                className="object-cover transition-transform duration-300 group-hover/bento:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)',
                }}
              />
            </Box>
          ) : (
            header
          )}
        </Box>
      )}

      {/* Content */}
      <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box>
          {/* Icon and Title */}
          {(icon || title) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {icon && (
                <Box sx={{ 
                  color: 'error.main',
                  '& svg': { width: 24, height: 24 }
                }}>
                  {icon}
                </Box>
              )}
              {title && (
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: { xs: '1rem', sm: '1.125rem' },
                  }}
                >
                  {title}
                </Typography>
              )}
            </Box>
          )}

          {/* Description */}
          {description && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                mb: 2,
              }}
            >
              {description}
            </Typography>
          )}

          {/* Children content */}
          {children}
        </Box>
      </Box>
    </Paper>
  )
}
