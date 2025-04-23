"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoginForm } from "@/components/login-form"
import { Logo } from "@/components/logo"
import { AuthSellingPoints } from "@/components/auth-selling-points"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)
  const [loginContext, setLoginContext] = useState<string | null>(null)

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

  // Pass the redirect parameter to the form so it can be used after login
  const redirectParam = searchParams.get("redirect")

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
