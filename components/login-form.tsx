"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { fadeIn, slideUp, staggerContainer } from "@/utils/animation"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/"
  
  // Properly decode the redirect path
  let decodedRedirectPath = redirectPath;
  try {
    if (redirectPath.includes('%')) {
      // Only decode once to avoid issues with double-encoding
      decodedRedirectPath = decodeURIComponent(redirectPath);
      console.log("Decoded redirect path:", decodedRedirectPath);
    }
    
    // Ensure it starts with a slash if it's a relative path
    if (!decodedRedirectPath.startsWith('/') && !decodedRedirectPath.startsWith('http')) {
      decodedRedirectPath = '/' + decodedRedirectPath;
    }
  } catch (e) {
    console.error("Error decoding redirect path:", e);
    // If decoding fails, use as-is
    decodedRedirectPath = redirectPath;
  }
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("Submitting login form...");
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      
      console.log("Login API response status:", res.status);
      const data = await res.json();
      console.log("Login API response data:", JSON.stringify(data).substring(0, 100) + "...");
      
      if (!res.ok) {
        throw new Error(data.error || 'Error logging in');
      }

      // Store user data in localStorage to help with auth state persistence
      if (data.user && data.session) {
        console.log("Storing auth data in localStorage");
        
        // Store the complete session details in exactly the format Supabase expects
        const storageData = {
          currentSession: {
            ...data.session,
            user: data.user  // Ensure the user is included in the session
          },
          expiresAt: Math.floor(Date.now() / 1000) + 3600
        };
        
        try {
          localStorage.setItem('supabase.auth.token', JSON.stringify(storageData));
          console.log("Auth data stored successfully");
        } catch (err) {
          console.error("Error storing auth data:", err);
        }
        
        // Add a slight delay to ensure localStorage is updated before redirect
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log("Auth data stored, redirecting to:", decodedRedirectPath);
      } else {
        console.warn("Login succeeded but no user/session data received");
      }

      // Show success message
      toast({
        title: 'welcome back!',
        description: 'successfully logged in',
        variant: 'default',
      });

      // Instead of using window.location, let's just reload the current page first to ensure auth state is properly loaded
      window.location.reload();
      
      // Then set a flag in sessionStorage to redirect after reload
      // Store the properly decoded path for the redirect
      sessionStorage.setItem('auth_redirect', decodedRedirectPath);
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'please check your credentials and try again';
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'please confirm your email address before logging in';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'too many login attempts, please try again later';
        } else {
          errorMessage = error.message.toLowerCase();
        }
      }
      toast({
        title: 'login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      
      // Build the OAuth callback URL with the redirect path
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      
      // Only add the redirect parameter if it's not the default homepage
      if (redirectPath !== '/') {
        callbackUrl.searchParams.set('redirect', redirectPath);
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      toast({
        title: "google sign-in failed",
        description: error.message || "please try again later",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeIn}>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2 h-10 lowercase"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path
                d="M21.35,11.1H12v3.73h5.41c-0.5,2.43-2.73,4.17-5.41,4.17c-3.3,0-6-2.7-6-6s2.7-6,6-6c1.56,0,2.98,0.6,4.07,1.58L20.07,5c-1.97-1.84-4.58-2.96-7.43-2.96c-5.52,0-10,4.48-10,10s4.48,10,10,10c5.67,0,9.4-4.01,9.4-9.65c0-0.58-0.05-1.15-0.15-1.71C21.8,11.58,21.35,11.1,21.35,11.1z"
                fill="#4285F4"
              ></path>
            </g>
          </svg>
          sign in with google
        </Button>
      </motion.div>

      <motion.div variants={fadeIn} className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground lowercase">or continue with</span>
        </div>
      </motion.div>

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        variants={slideUp}
      >
        <motion.div variants={fadeIn} className="space-y-2">
          <Label htmlFor="email">email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="hello@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </motion.div>
        <motion.div variants={fadeIn} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline lowercase">
              forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
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
        </motion.div>
        <motion.div
          variants={fadeIn}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button type="submit" className="w-full gap-1 lowercase" disabled={isLoading}>
            {isLoading ? (
              "signing in..."
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                sign in
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  )
}
