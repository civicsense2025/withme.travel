"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient, resetClient } from "@/utils/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { fadeIn, slideUp, staggerContainer } from "@/utils/animation"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/"
  const urlError = searchParams.get("error")
  const { toast } = useToast()
  const { signIn, isLoading, error: authError, user } = useAuth()
  const [inlineError, setInlineError] = useState<string | null>(null)
  
  // Handle decoded redirect path
  const [decodedRedirectPath, setDecodedRedirectPath] = useState("/")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const supabase = createClient()!
  
  // Handle URL error parameter when component mounts
  useEffect(() => {
    if (urlError) {
      console.error("[LoginForm] URL error parameter:", urlError);
      let errorMessage = 'Authentication error';
      
      // Handle known error codes from callback
      if (urlError === 'pkce_failed') {
        errorMessage = 'authentication process interrupted, please try again';
      } else if (urlError === 'invalid_redirect') {
        errorMessage = 'invalid redirect url, please try again';
      } else if (urlError === 'email_not_confirmed') {
        errorMessage = 'please confirm your email before signing in';
      } else if (urlError.includes('invalid_login')) {
        errorMessage = 'invalid email or password';
      } else {
        // Try to make the error more user-friendly
        errorMessage = urlError.replace(/_/g, ' ').toLowerCase();
      }
      
      setInlineError(errorMessage);
      toast({
        title: 'login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Remove the error from URL to prevent showing it again on refresh
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('error');
      
      // Replace the URL without the error param, but keep other params
      const newPath = window.location.pathname + 
        (newParams.toString() ? `?${newParams.toString()}` : '');
      
      router.replace(newPath);
    }
  }, [urlError, toast, router, searchParams]);
  
  // Decode redirect path once when component mounts or redirectPath changes
  useEffect(() => {
    try {
      let decoded = redirectPath;
      if (redirectPath.includes('%')) {
        // Only decode once to avoid issues with double-encoding
        decoded = decodeURIComponent(redirectPath);
        console.log("Decoded redirect path:", decoded);
      }
      
      // Ensure it starts with a slash if it's a relative path
      if (!decoded.startsWith('/') && !decoded.startsWith('http')) {
        decoded = '/' + decoded;
      }
      
      setDecodedRedirectPath(decoded);
    } catch (e) {
      console.error("Error decoding redirect path:", e);
      setDecodedRedirectPath(redirectPath);
    }
  }, [redirectPath]);
  
  // Handle successful authentication and redirect
  useEffect(() => {
    console.log("[LoginForm] Auth state updated - User:", !!user, "isLoading:", isLoading);
    
    if (user) {
      console.log("[LoginForm] User authenticated, redirecting to:", decodedRedirectPath);
      router.push(decodedRedirectPath);
    }
  }, [user, decodedRedirectPath, router, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInlineError(null);
    try {
      console.log("[LoginForm] Submitting login form with email:", formData.email);
      // Reset Supabase client if there was a previous error to ensure a clean session
      if (authError && authError.message && authError.message.includes('timed out')) {
        try {
          console.log("[LoginForm] Resetting Supabase client due to previous timeout");
          await resetClient();
        } catch (e) {
          console.warn("[LoginForm] Failed to reset client", e);
        }
      }
      
      await signIn(formData.email, formData.password);
      console.log("[LoginForm] Sign-in successful");
      
      toast({
        title: 'welcome back!',
        description: 'successfully logged in',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('[LoginForm] Login error:', error);
      
      // Try to extract more information about the error
      const errorDetails = {
        message: error.message || 'Unknown error',
        code: error.code || 'no_code',
        status: error.status || 'no_status',
        stack: error.stack || 'no_stack'
      };
      console.error('[LoginForm] Error details:', errorDetails);
      
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
      setInlineError(errorMessage);
      toast({
        title: 'login failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Clear any existing auth session storage to prevent PKCE conflicts
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('supabase-auth-token');
          sessionStorage.removeItem('supabase-auth-token');
          console.log("[LoginForm] Cleared previous auth tokens before Google sign-in");
        } catch (e) {
          console.warn("[LoginForm] Failed to clear tokens", e);
        }
      }
      
      // Build the OAuth callback URL with the redirect path
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      
      // Only add the redirect parameter if it's not the default homepage
      if (redirectPath !== '/') {
        callbackUrl.searchParams.set('redirect', redirectPath);
      }
      
      // Add timestamp to prevent caching issues with PKCE
      callbackUrl.searchParams.set('_t', Date.now().toString());
      
      console.log("[LoginForm] Google sign-in callback URL:", callbackUrl.toString());
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error("[LoginForm] Google sign-in error:", error);
        throw error;
      }
      
      if (!data?.url) {
        console.error("[LoginForm] No OAuth URL returned");
        throw new Error("No OAuth URL returned");
      }
      
      console.log("[LoginForm] Google sign-in initiated successfully, redirecting to:", data.url);
      
      // The auth library will handle the redirect automatically
    } catch (error: any) {
      console.error("[LoginForm] Google sign-in exception:", error);
      toast({
        title: "google sign-in failed",
        description: error.message || "please try again later",
        variant: "destructive",
      });
    }
  }

  // Debug information
  useEffect(() => {
    if (authError) {
      console.error("[LoginForm] Auth error from context:", authError);
      
      // Extract error message from authError object
      let errorMessage = '';
      if (typeof authError === 'string') {
        errorMessage = authError;
      } else if (authError?.message) {
        errorMessage = authError.message;
        
        // Handle specific error cases
        if (errorMessage.includes('timed out')) {
          errorMessage = 'Authentication is taking longer than expected. Please try again.';
        } else if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address before logging in.';
        }
      } else {
        errorMessage = 'An unknown error occurred during authentication.';
      }
      
      // Set error message for display
      setInlineError(errorMessage);
      
      // Show toast notification for auth errors
      toast({
        title: 'authentication error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
    
    if (urlError) {
      console.error("[LoginForm] URL error parameter:", urlError);
      // Set URL error message for display
      setInlineError(urlError);
    }
  }, [authError, urlError, toast]);

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
        {(urlError || inlineError || authError) && (
          <motion.div
            variants={fadeIn}
            className="text-destructive text-sm mt-2 text-center"
            role="alert"
            aria-live="polite"
          >
            {urlError || inlineError || (typeof authError === 'string' ? authError : authError?.message)}
          </motion.div>
        )}
      </motion.form>
    </motion.div>
  )
}

