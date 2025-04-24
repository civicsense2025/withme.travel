"use client";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { Suspense } from "react";
import { SearchProvider } from "@/contexts/search-context";
import { CommandMenu } from "@/components/search/command-menu";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
export function ClientLayout({ children }) {
    return (<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
    </ThemeProvider>);
}
