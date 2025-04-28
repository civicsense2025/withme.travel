"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"
import { createClient } from "@/utils/supabase/client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoginForm } from "@/components/login-form"
import { Logo } from "@/components/logo"
import { AuthSellingPoints } from "@/components/auth-selling-points"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading, error, signOut } = useAuth()
  const { toast } = useToast()
  const [message, setMessage] = useState<string | null>(null)
  const [loginContext, setLoginContext] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Get redirect path and decode safely
  const redirectPath = useSafeRedirectPath(searchParams.get("redirect") || "/")
  
  console.log('[LoginPage] Auth state:', { user: !!user, isLoading, error: !!error })
  console.log('[LoginPage] Redirect path:', redirectPath)

  // Helper function for safe redirect path processing
  function useSafeRedirectPath(path: string): string {
    const [safePath, setSafePath] = useState("/")
    
    useEffect(() => {
      try {
        // Remove any leading/trailing whitespace
        let cleanPath = path.trim()
        
        // If the path looks URL-encoded (contains %), try to decode it once
        if (cleanPath.includes('%')) {
          // Only decode once to avoid double-decoding issues
          cleanPath = decodeURIComponent(cleanPath)
        }
        
        // Ensure it starts with a slash if it's a relative path and not an absolute URL
        if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) {
          cleanPath = '/' + cleanPath
        }
        
        setSafePath(cleanPath)
      } catch (e) {
        console.error('[LoginPage] Error processing redirect path:', e)
        setSafePath("/")
      }
    }, [path])
    
    return safePath
  }

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      console.log('[LoginPage] User authenticated, redirecting to:', redirectPath)
      setIsRedirecting(true)
      
      // Add a small delay for UI feedback
      setTimeout(() => {
        router.replace(redirectPath)
      }, 100)
    }
  }, [user, isLoading, redirectPath, router])

  // Process url parameters - message and login context
  useEffect(() => {
    // Handle message from query params
    const message = searchParams.get("message")
    if (message) {
      setMessage(message)
      
      // Show toast for important messages
      if (message.includes("expired") || message.includes("out") || message.includes("failed")) {
        toast({
          title: "Authentication Notice",
          description: message,
          variant: "default"
        })
      }
    }
    
    // Detect where the user is coming from and provide appropriate context
    const redirectParam = searchParams.get("redirect")
    if (redirectParam) {
      if (redirectParam.includes('/trips/create')) {
        setLoginContext("to create a new trip")
      } else if (redirectParam.includes('/trips')) {
        setLoginContext("to access your trips")
      } else if (redirectParam.includes('/saved')) {
        setLoginContext("to view your saved items")
      } else if (redirectParam.includes('/profile')) {
        setLoginContext("to access your profile")
      }
    }
  }, [searchParams, toast])

  // Show loading state while checking auth or redirecting
  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            {isRedirecting ? "Redirecting..." : "Checking authentication..."}
          </p>
        </div>
      </div>
    )
  }
  
  // Don't render login form if already logged in
  if (user) {
    return null
  }

  // Handler for clearing auth state
  const handleClearAuthData = async () => {
    try {
      setMessage("Clearing authentication data...");
      
      // Call the server endpoint to clear cookies
      await fetch('/api/auth/clear-cookies', { 
        method: 'POST',
        credentials: 'include'
      });
      
      // Use signOut from auth context to properly clear state
      await signOut();
      
      toast({
        title: "Auth data cleared",
        description: "You can now try logging in again",
        variant: "default"
      });
      
      setMessage("Auth data cleared. Try logging in again.");
    } catch (error) {
      console.error("Error clearing auth data:", error);
      setMessage("Error clearing auth data. Please try again.");
      
      toast({
        title: "Error",
        description: "Could not clear authentication data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-0">
      <div className="w-full max-w-md flex flex-col">
        <div className="md:hidden mb-6">
           <AuthSellingPoints />
        </div>
        
        <Card className="border border-border/10 dark:border-border/10 shadow-xl dark:shadow-2xl dark:shadow-black/20">
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
            <div className="pt-4 border-t border-border/10 dark:border-border/10 mt-4">
              <p className="text-xs text-muted-foreground mb-2">Having trouble logging in?</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs border-border/20 dark:border-border/10 hover:bg-muted/50"
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
                href={redirectPath !== "/" ? `/signup?redirect=${encodeURIComponent(redirectPath)}` : "/signup"} 
                className="text-primary hover:underline font-medium"
              >
                sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="hidden md:block mt-8">
          <AuthSellingPoints />
        </div>
      </div>
    </div>
  )
}
