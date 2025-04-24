"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/use-auth"

// Cookie name for consent tracking
const COOKIE_CONSENT_KEY = "withme_cookie_consent"

// Helper function to set a cookie with specified parameters
function setCookie(name: string, value: string, days = 365) {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = "; expires=" + date.toUTCString()
  // Ensure SameSite=Lax and Secure in production
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax" + secure;
}

// Helper function to get a cookie value by name
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const { supabase } = useAuth();

  useEffect(() => {
    const cookiesAccepted = getCookie(COOKIE_CONSENT_KEY) === "true" || localStorage.getItem("cookiesAccepted") === "true"
    
    if (!cookiesAccepted) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = async () => {
    localStorage.setItem("cookiesAccepted", "true")
    setCookie(COOKIE_CONSENT_KEY, "true", 365)
    
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing Supabase session on cookie consent:", error);
      }
    } catch (error) {
      console.error("Exception refreshing Supabase session:", error)
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
