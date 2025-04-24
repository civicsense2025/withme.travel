"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { resetClient } from "@/utils/supabase/client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoginForm } from "@/components/login-form"
import { Logo } from "@/components/logo"
import { AuthSellingPoints } from "@/components/auth-selling-points"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [message, setMessage] = useState<string | null>(null)
  const [loginContext, setLoginContext] = useState<string | null>(null)

  console.log('[LoginPage] User:', user)
  console.log('[LoginPage] isLoading:', isLoading)
  console.log('[LoginPage] Redirect param:', searchParams.get("redirect"))

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      const redirectTo = searchParams.get("redirect") || "/"
      
      // Ensure the redirect path is properly decoded
      // Remove any leading/trailing whitespace and handle potential double-encoding
      let cleanRedirectPath = redirectTo.trim();
      
      // If the path looks URL-encoded (contains %), try to decode it once
      if (cleanRedirectPath.includes('%')) {
        try {
          // Only decode once to avoid double-decoding issues
          cleanRedirectPath = decodeURIComponent(cleanRedirectPath);
          console.log('[LoginPage] Decoded redirect path:', cleanRedirectPath);
        } catch (e) {
          console.error('[LoginPage] Error decoding redirect path:', e);
          // If decoding fails, use the original path
          cleanRedirectPath = redirectTo;
        }
      }
      
      // Ensure it starts with a slash if it's a relative path and not an absolute URL
      if (!cleanRedirectPath.startsWith('/') && !cleanRedirectPath.startsWith('http')) {
        cleanRedirectPath = '/' + cleanRedirectPath;
      }
      
      console.log('[LoginPage] Redirecting after login to:', cleanRedirectPath);
      router.replace(cleanRedirectPath);
    }
    
    // Check for redirect flag from session storage (set by login form)
    if (typeof window !== 'undefined') {
      const storedRedirect = sessionStorage.getItem('auth_redirect');
      if (storedRedirect) {
        console.log('[LoginPage] Found stored redirect:', storedRedirect);
        // Clear the stored redirect first to prevent loops
        sessionStorage.removeItem('auth_redirect');
        
        // Check if user data exists in localStorage
        const userData = localStorage.getItem('supabase.auth.token');
        if (userData) {
          console.log('[LoginPage] User data found in localStorage, redirecting');
          window.location.href = storedRedirect;
        }
      }
    }
  }, [user, isLoading, router, searchParams])

  // Get message from query params
  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setMessage(message)
    }
    
    // Detect where the user is coming from and provide appropriate context
    const redirectPath = searchParams.get("redirect")
    if (redirectPath) {
      if (redirectPath.includes('/trips/create')) {
        setLoginContext("to create a new trip")
      } else if (redirectPath.includes('/trips')) {
        setLoginContext("to access your trips")
      } else if (redirectPath.includes('/saved')) {
        setLoginContext("to view your saved items")
      }
    }
  }, [searchParams])

  // Don't render anything while checking auth
  if (isLoading || user) {
    return null
  }

  // Pass the redirect parameter to the form so it can be used after login
  const redirectParam = searchParams.get("redirect")

  // Add handler for clearing auth data
  const handleClearAuthData = async () => {
    resetClient();
    // Also call the server endpoint to clear cookies
    try {
      await fetch('/api/auth/clear-cookies');
      setMessage("Auth data cleared. Try logging in again.");
      // Force refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error clearing auth data:", error);
      setMessage("Error clearing auth data. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-1 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-0">
      <div className="w-full max-w-lg">
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-bold text-center">welcome back!</CardTitle>
            <CardDescription className="text-center">
              {loginContext ? (
                <>sign in {loginContext}</>
              ) : (
                <>sign in to continue planning your adventures</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <LoginForm />
            
            {/* Debug utility for clearing auth data */}
            <div className="pt-4 border-t mt-4">
              <p className="text-xs text-muted-foreground mb-2">Having trouble logging in?</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={handleClearAuthData}
              >
                Clear Auth Data & Try Again
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-center text-sm text-muted-foreground">
              don't have an account yet?{" "}
              <Link 
                href={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : "/signup"} 
                className="text-primary hover:underline"
              >
                sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        {/* Selling points */}
        <AuthSellingPoints />
      </div>
    </div>
  )
}
