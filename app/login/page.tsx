"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoginForm } from "@/components/login-form"
import { Logo } from "@/components/logo"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)

  // Get message from query params
  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setMessage(message)
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-1 py-12">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold text-center">welcome back!</CardTitle>
          <CardDescription className="text-center">sign in to continue planning your adventures</CardDescription>
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
            <Link href="/signup" className="text-primary hover:underline">
              sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
