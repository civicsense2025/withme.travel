"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { AuthSellingPoints } from "@/components/auth-selling-points"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "something went wrong. please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-1 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-0">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">forgot password</CardTitle>
            <CardDescription>enter your email and we'll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <Alert>
                <AlertDescription>
                  <p className="font-medium">check your email</p>
                  <p className="mt-2">
                    we've sent a password reset link to <span className="font-medium">{email}</span>. please check your
                    inbox and follow the instructions.
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hello@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "sending reset link..." : "send reset link"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col space-y-2">
              <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        {/* Selling points */}
        <AuthSellingPoints />
      </div>
    </div>
  )
}
