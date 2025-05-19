'use client';

/**
 * Login Form Component
 * 
 * A clean, modern login form with social login options
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { fadeIn, slideUp, staggerContainer } from '@/utils/animation';
import { LoginFormProps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Clean, modern login form with social login options
 */
export function LoginForm({
  onSuccess,
  primaryButtonText = 'Log In',
  redirectAfterLogin = true,
  redirectUrl,
  showSignUpLink = true,
  signUpLinkText = "Don't have an account? Sign up",
  className = '',
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Get redirect URL from URL params or use default
  const getRedirectUrl = () => {
    // First check explicitly provided redirectUrl prop
    if (redirectUrl) return redirectUrl;
    
    // Then check URL params
    const urlRedirect = searchParams?.get('redirect');
    if (urlRedirect) return urlRedirect;
    
    // Default to dashboard
    return '/dashboard';
  };

  // Check for error parameter in URL
  useEffect(() => {
    const errorCode = searchParams?.get('error');
    if (errorCode) {
      let errorMessage = 'An error occurred during sign in';
      
      if (errorCode === 'unauthorized') {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (errorCode === 'not_confirmed') {
        errorMessage = 'Please verify your email before signing in.';
      }
      
      setError(errorMessage);
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  // Handle email/password login
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        if (redirectAfterLogin) {
          router.push(getRedirectUrl());
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'Failed to sign in. Please check your credentials.';
      
      setError(errorMessage);
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      
      // Construct callback URL with any existing search params
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      
      // Add redirect parameter
      callbackUrl.searchParams.set('redirect', getRedirectUrl());
      
      // Initiate Google OAuth sign-in
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Google Sign-in Failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      className={`space-y-6 ${className}`}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Form Title */}
      <motion.div variants={fadeIn} className="text-center mb-6">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sign in to your account to continue
        </p>
      </motion.div>
      
      {/* Google Sign In Button */}
      <motion.div variants={fadeIn}>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2 h-12 rounded-full bg-white border border-gray-200 shadow-sm text-base font-semibold text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          aria-label="Sign in with Google"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <g>
              <path
                fill="#4285F4"
                d="M24 9.5c3.54 0 6.36 1.53 7.82 2.81l5.77-5.62C34.5 3.7 29.74 1.5 24 1.5 14.98 1.5 7.09 7.6 3.88 15.09l6.91 5.37C12.5 15.13 17.77 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.1 24.5c0-1.64-.15-3.22-.43-4.74H24v9.24h12.4c-.54 2.9-2.18 5.36-4.66 7.04l7.18 5.59C43.91 37.13 46.1 31.3 46.1 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.79 28.46A14.5 14.5 0 019.5 24c0-1.56.27-3.07.76-4.46l-6.91-5.37A23.94 23.94 0 001.5 24c0 3.77.9 7.34 2.49 10.46l6.8-6z"
              />
              <path
                fill="#EA4335"
                d="M24 46.5c6.48 0 11.92-2.15 15.89-5.87l-7.18-5.59c-2 1.36-4.56 2.16-8.71 2.16-6.23 0-11.5-5.63-13.21-13.04l-6.8 6C7.09 40.4 14.98 46.5 24 46.5z"
              />
            </g>
          </svg>
          Sign in with Google
        </Button>
      </motion.div>

      {/* Divider */}
      <motion.div variants={fadeIn} className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={fadeIn}
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* Email/Password Form */}
      <motion.form variants={fadeIn} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(!!checked)}
          />
          <Label htmlFor="remember-me" className="text-sm font-normal">
            Remember me for 30 days
          </Label>
        </div>
        
        <Button
          type="submit"
          className="w-full h-11"
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading ? 'Signing in...' : primaryButtonText}
        </Button>
      </motion.form>

      {/* Sign Up Link */}
      {showSignUpLink && (
        <motion.div variants={fadeIn} className="text-center text-sm">
          <span className="text-muted-foreground">
            {signUpLinkText.split('Sign up')[0]}
          </span>{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
} 