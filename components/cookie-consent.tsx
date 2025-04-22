"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem("cookiesAccepted")
    if (!cookiesAccepted) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    // Set with no expiration date for permanent storage
    localStorage.setItem("cookiesAccepted", "true")
    setShowConsent(false)
  }

  const dismissConsent = () => {
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
