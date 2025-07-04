"use client"

import React, { type ReactNode } from "react"
import { SessionProvider } from "next-auth/react"

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  )
}
