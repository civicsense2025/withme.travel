"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/utils/supabase/client"

// Cookie name for consent tracking
const COOKIE_CONSENT_KEY = "withme_cookie_consent"

// Helper function to set a cookie with specified parameters
function setCookie(name: string, value: string, days = 365) {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = "; expires=" + date.toUTCString()
  document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax"
}

// Helper function to get a cookie value by name
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = getCookie(COOKIE_CONSENT_KEY) === "true" || localStorage.getItem("cookiesAccepted") === "true"
    
    if (!cookiesAccepted) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    // Store consent in both localStorage (for legacy support) and as a cookie
    localStorage.setItem("cookiesAccepted", "true")
    setCookie(COOKIE_CONSENT_KEY, "true", 365) // Set cookie for 1 year
    
    // Let Supabase know cookies are accepted
    // This might trigger a re-auth if auth is configured to use cookies
    try {
      // Re-emit session to ensure it's properly stored with cookies
      supabase.auth.refreshSession()
    } catch (error) {
      console.error("Error refreshing Supabase session:", error)
    }
    
    setShowConsent(false)
  }

  const dismissConsent = () => {
    // Just hide the banner without accepting cookies
    setShowConsent(false)
  }

  if (!showConsent) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 p-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            We use cookies to enhance your experience on our site. They help us understand how you use our site and
            personalize content. By continuing to use withme.travel, you agree to our{" "}
            <Link href="/privacy" className="text-green-600 hover:underline dark:text-green-400">
              privacy policy
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={acceptCookies} size="sm" className="whitespace-nowrap">
            Accept Cookies
          </Button>
          <Button variant="ghost" size="icon" onClick={dismissConsent} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
