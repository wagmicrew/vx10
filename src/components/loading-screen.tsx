"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { WarpBackground } from '@/components/magicui/warp-background'

interface LoadingScreenProps {
  isLoading?: boolean
}

export function LoadingScreen({ isLoading = true }: LoadingScreenProps = {}) {

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <WarpBackground
            className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-red-900 border-0 rounded-none p-0 flex items-center justify-center"
            perspective={150}
            beamsPerSide={4}
            beamSize={3}
            beamDelayMax={2}
            beamDelayMin={0.5}
            beamDuration={4}
            gridColor="rgba(220, 38, 38, 0.3)"
          >
            <div className="flex flex-col items-center space-y-6 z-10 relative">
              {/* Logo with Glow Effect */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateY: -180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-24 h-24 mb-4"
              >
                <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl animate-pulse"></div>
                <Image
                  src="/images/din-logo.png"
                  alt="Din Trafikskola Hässleholm"
                  fill
                  sizes="96px"
                  className="object-contain relative z-10 drop-shadow-2xl"
                  priority
                />
              </motion.div>

              {/* Brand Text with Enhanced Styling */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center"
              >
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg"
                    style={{ fontFamily: 'Didot, Bodoni, "Playfair Display", serif' }}>
                  <span className="text-red-400">Din</span> Trafikskola
                </h1>
                <p className="text-lg text-red-200 italic drop-shadow-md"
                   style={{ fontFamily: 'Didot, Bodoni, "Playfair Display", serif' }}>
                  Hässleholm
                </p>
              </motion.div>

              {/* Modern Loading Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="relative"
              >
                <div className="w-12 h-12 relative">
                  <div className="absolute inset-0 border-4 border-red-200/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-red-400 border-r-red-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-2 border-2 border-transparent border-t-white border-r-white rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1s'}}></div>
                </div>
              </motion.div>

              {/* Loading Text with Pulse */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="text-center"
              >
                <p className="text-white/90 text-lg font-medium drop-shadow-md animate-pulse">
                  Startar din körkortsresa...
                </p>
                <p className="text-red-200/70 text-sm mt-1">
                  Vänligen vänta
                </p>
              </motion.div>

              {/* Additional Brand Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex items-center space-x-4 text-red-200/60 text-sm"
              >
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                  <span>Professionell utbildning</span>
                </div>
                <div className="w-1 h-1 bg-red-400/50 rounded-full"></div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  <span>Säker körning</span>
                </div>
              </motion.div>
            </div>
          </WarpBackground>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
