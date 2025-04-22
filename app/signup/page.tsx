"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, UserPlus, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/logo"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Get invitation token or referral code from URL
  const invitationToken = searchParams.get("invitation")
  const referralCode = searchParams.get("ref")

  // Pre-fill email if coming from invitation
  useEffect(() => {
    if (invitationToken) {
      // Fetch invitation details to get the email
      async function getInvitationDetails() {
        try {
          const response = await fetch(`/api/invitations/${invitationToken}`)
          if (response.ok) {
            const data = await response.json()
            if (data.invitation?.email) {
              setFormData((prev) => ({
                ...prev,
                email: data.invitation.email,
              }))
            }
          }
        } catch (error) {
          console.error("Error fetching invitation details:", error)
        }
      }

      getInvitationDetails()
    }
  }, [invitationToken])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback${invitationToken ? `?invitation=${invitationToken}` : ""}`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // Create user in our database with referral information
      const userData = {
        id: data.user?.id,
        email: formData.email,
        name: formData.name,
        referred_by: referralCode || null,
      }

      const { error: userError } = await supabase.from("profiles").insert([userData])

      if (userError) {
        throw userError
      }

      // If there's an invitation token, accept it immediately
      if (invitationToken) {
        try {
          await fetch(`/api/invitations/${invitationToken}/accept`, {
            method: "POST",
          })
        } catch (inviteError) {
          console.error("Error accepting invitation:", inviteError)
          // Continue with signup even if invitation acceptance fails
        }
      }

      // Show success message
      setSuccess(true)
      toast({
        title: "account created!",
        description: "please check your email to verify your account.",
      })

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
      })
    } catch (error: any) {
      console.error("Signup error:", error)
      setError(error.message || "an error occurred during signup")
      toast({
        title: "signup failed",
        description: error.message || "an error occurred during signup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    try {
      setIsGoogleLoading(true)

      // Get the redirect URL
      const redirectUrl = searchParams.get("redirect") || "/"

      // Include invitation token in the redirect if present
      let callbackUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`
      if (invitationToken) {
        callbackUrl += `&invitation=${invitationToken}`
      }
      if (referralCode) {
        callbackUrl += `&ref=${referralCode}`
      }

      // Sign in with Google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
            scope:
              "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
          },
        },
      })

      if (error) {
        throw error
      }

      // The user will be redirected to Google for authentication
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      toast({
        title: "Google sign-in failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-1 py-12">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold text-center">create an account</CardTitle>
          <CardDescription className="text-center">
            {invitationToken
              ? "join withme.travel and accept your trip invitation"
              : "join withme.travel and start planning adventures with friends"}
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <p className="font-medium">account created successfully!</p>
                <p className="mt-2">
                  we've sent a verification email to <span className="font-medium">{formData.email}</span>. please check
                  your inbox and click the verification link to activate your account.
                </p>
              </AlertDescription>
            </Alert>
            <div className="flex flex-col space-y-2 mt-4">
              <Button asChild>
                <Link href="/login">go to login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">back to home</Link>
              </Button>
            </div>
          </CardContent>
        ) : (
          <>
            <CardContent className="space-y-4">
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2 h-10"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                      <path
                        d="M21.35,11.1H12v3.73h5.41c-0.5,2.43-2.73,4.17-5.41,4.17c-3.3,0-6-2.7-6-6s2.7-6,6-6c1.56,0,2.98,0.6,4.07,1.58L20.07,5c-1.97-1.84-4.58-2.96-7.43-2.96c-5.52,0-10,4.48-10,10s4.48,10,10,10c5.67,0,9.4-4.01,9.4-9.65c0-0.58-0.05-1.15-0.15-1.71C21.8,11.58,21.35,11.1,21.35,11.1z"
                        fill="#4285F4"
                      ></path>
                    </g>
                  </svg>
                )}
                {isGoogleLoading ? "Signing in..." : "Sign up with Google"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">first name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="your name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="hello@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      readOnly={invitationToken && formData.email !== ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">create password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">at least 6 characters</p>
                  </div>
                  <Button type="submit" className="w-full gap-1" disabled={isLoading}>
                    {isLoading ? (
                      "creating account..."
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        create account
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center text-sm text-muted-foreground w-full">
                already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  sign in
                </Link>
              </p>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
