import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CookieConsent } from "@/components/cookie-consent"
import { Suspense } from "react"
import { SearchProvider } from "@/contexts/search-context"
import { CommandMenu } from "@/components/search/command-menu"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "withme.travel | Group Travel Planning Made Simple",
  description:
    "Plan group trips with friends and family. Collaborate on itineraries, vote on activities, and manage expenses together.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <SearchProvider>
              <CommandMenu />
              <Suspense>
                <Navbar />
              </Suspense>
              <main className="min-h-[calc(100vh-4rem-4rem)]">{children}</main>
              <Footer />
              <CookieConsent />
              <Toaster />
            </SearchProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
