/**
 * AuthForm Component
 * 
 * A versatile authentication form that supports login, signup, and password reset flows.
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { fadeIn, slideUp, staggerContainer } from '@/utils/animation';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Authentication form modes
 */
export type AuthFormMode = 'login' | 'signup' | 'reset-password';

/**
 * Props for AuthForm
 */
export interface AuthFormProps {
  /** Form mode: login, signup, or reset-password */
  mode?: AuthFormMode;
  /** Optional callback function to call when authentication is successful */
  onSuccess?: () => void;
  /** Optional custom text for the primary button */
  primaryButtonText?: string;
  /** Whether to redirect after successful authentication */
  redirectAfterAuth?: boolean;
  /** Custom redirect URL (defaults to /dashboard) */
  redirectUrl?: string;
  /** Show a link to toggle between login and signup */
  showToggleLink?: boolean;
  /** Whether to show social login options */
  showSocialLogin?: boolean;
  /** Whether to show the remember me option */
  showRememberMe?: boolean;
  /** Additional CSS class names */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AuthForm handles login, signup and password reset flows
 */
export function AuthForm({
  mode = 'login',
  onSuccess,
  primaryButtonText,
  redirectAfterAuth = true,
  redirectUrl,
  showToggleLink = true,
  showSocialLogin = true,
  showRememberMe = true,
  className = '',
}: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  // Form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Default button text based on mode
  const getDefaultButtonText = () => {
    switch (mode) {
      case 'login': return 'Sign In';
      case 'signup': return 'Create Account';
      case 'reset-password': return 'Reset Password';
      default: return 'Submit';
    }
  };

  // Button text to display
  const buttonText = primaryButtonText || getDefaultButtonText();

  // Title based on mode
  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create an Account';
      case 'reset-password': return 'Reset Your Password';
      default: return 'Authentication';
    }
  };

  // Subtitle based on mode
  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your account to continue';
      case 'signup': return 'Fill out the form to get started';
      case 'reset-password': return 'Enter your email to receive a reset link';
      default: return '';
    }
  };

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
      let errorMessage = 'An error occurred during authentication';
      
      if (errorCode === 'unauthorized') {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (errorCode === 'not_confirmed') {
        errorMessage = 'Please verify your email before signing in.';
      }
      
      setError(errorMessage);
      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [searchParams, toast]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      // Different handling based on mode
      if (mode === 'login') {
        // Login flow
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
          
          if (redirectAfterAuth) {
            router.push(getRedirectUrl());
            router.refresh();
          }
        }
      } else if (mode === 'signup') {
        // Signup flow
        // Validate password match
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        // Create user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
          },
        });
        
        if (error) throw error;
        
        // Success message
        toast({
          title: 'Account created',
          description: 'Please check your email to verify your account.',
        });
        
        if (onSuccess) {
          onSuccess();
        }
        
        if (redirectAfterAuth) {
          router.push('/auth/verify-email');
        }
      } else if (mode === 'reset-password') {
        // Password reset flow
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/update-password`,
        });
        
        if (error) throw error;
        
        toast({
          title: 'Password reset email sent',
          description: 'Please check your email for the password reset link.',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      
      setError(errorMessage);
      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social sign in
  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    try {
      setIsSocialLoading(true);
      setError(null);
      
      // Construct callback URL with any existing search params
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      
      // Add redirect parameter
      callbackUrl.searchParams.set('redirect', getRedirectUrl());
      
      // Initiate OAuth sign-in
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error(`${provider} sign-in error:`, error);
      toast({
        title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign-in Failed`,
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
      setIsSocialLoading(false);
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
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {getSubtitle()}
        </p>
      </motion.div>
      
      {/* Social Login Buttons */}
      {showSocialLogin && mode !== 'reset-password' && (
        <>
          <motion.div variants={fadeIn} className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11"
              onClick={() => handleSocialSignIn('google')}
              disabled={isSocialLoading || isLoading}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
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
              {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11"
              onClick={() => handleSocialSignIn('github')}
              disabled={isSocialLoading || isLoading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              {mode === 'login' ? 'Sign in with GitHub' : 'Sign up with GitHub'}
            </Button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeIn} className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </motion.div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          variants={fadeIn}
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <motion.form variants={fadeIn} onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field - Signup only */}
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete={mode === 'login' ? 'username' : 'email'}
            required
          />
        </div>
        
        {/* Password Field - Not for reset-password */}
        {mode !== 'reset-password' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === 'login' && (
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
        
        {/* Confirm Password Field - Signup only */}
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>
        )}
        
        {/* Remember Me Checkbox - Login only */}
        {mode === 'login' && showRememberMe && (
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
        )}
        
        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11"
          disabled={isLoading || isSocialLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              {mode === 'login' ? 'Signing in...' : mode === 'signup' ? 'Creating account...' : 'Sending email...'}
            </>
          ) : (
            <>
              {mode === 'login' && <LogIn className="mr-2 h-4 w-4" />}
              {mode === 'signup' && <UserPlus className="mr-2 h-4 w-4" />}
              {mode === 'reset-password' && <ArrowRight className="mr-2 h-4 w-4" />}
              {buttonText}
            </>
          )}
        </Button>
      </motion.form>

      {/* Toggle Link */}
      {showToggleLink && mode !== 'reset-password' && (
        <motion.div variants={fadeIn} className="text-center text-sm">
          {mode === 'login' ? (
            <>
              <span className="text-muted-foreground">Don&apos;t have an account?</span>{' '}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">Already have an account?</span>{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
} 