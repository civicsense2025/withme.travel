"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useCsrf } from "@/components/csrf-provider"
import { fadeIn, staggerContainer } from "@/utils/animation"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { csrfToken, loading: csrfLoading } = useCsrf()
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Check for token in URL
  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setError("No reset token found. Please request a new password reset link.")
      toast({
        title: "Missing Token",
        description: "No reset token found. Please request a new password reset link.",
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }
    
    // Check for uppercase, lowercase, and number
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      return
    }
    
    // Check for CSRF token
    if (!csrfToken) {
      setError("Missing security token. Please refresh the page.")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          password,
          csrfToken,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password")
      }
      
      // Show success message
      setSuccess(true)
      setPassword("")
      setConfirmPassword("")
      
      toast({
        title: "Password Reset",
        description: "Your password has been successfully reset.",
      })
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      console.error("Reset password error:", err)
      setError(err.message || "Failed to reset password")
      
      toast({
        title: "Reset Failed",
        description: err.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <motion.div
        className="space-y-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeIn} className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below
          </p>
        </motion.div>

        {error && (
          <motion.div
            variants={fadeIn}
            className="bg-destructive/10 text-destructive p-3 rounded-md text-sm"
          >
            {error}
          </motion.div>
        )}

        {success ? (
          <motion.div
            variants={fadeIn}
            className="bg-green-100 text-green-800 p-4 rounded-md text-center"
          >
            <p className="font-medium">Password reset successful!</p>
            <p className="text-sm mt-1">
              You will be redirected to the login page in a moment.
            </p>
          </motion.div>
        ) : (
          <motion.form
            variants={fadeIn}
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters and include uppercase, lowercase, and a number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || csrfLoading}
            >
              {isSubmitting ? (
                "Resetting Password..."
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Reset Password
                </>
              )}
            </Button>
          </motion.form>
        )}
      </motion.div>
    </div>
  )
}
