"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"
import { Apollo } from "@/lib/api/graphql"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Apollo>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="app-theme"
        >
          {children}
        </ThemeProvider>
      </SessionProvider>
    </Apollo>
  )
}