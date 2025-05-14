'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/hooks/use-auth';
import { fadeIn, slideUp, staggerContainer } from '@/utils/animation';
import { AuthModalContext } from '@/app/context/auth-modal-context';

interface LoginFormProps {
  /** Optional callback function to call when login is successful */
  onSuccess?: () => void;
  /** Optional custom text for the primary button */
  primaryButtonText?: string;
  /** Optional context for analytics and customization */
  context?: AuthModalContext;
}

export function LoginForm({
  onSuccess,
  primaryButtonText = 'Sign In',
  context = 'default',
}: LoginFormProps) {
  const { signIn, isLoading, user, refreshSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get and process redirect path
  const redirectPath = searchParams?.get('redirect') || '/';
  const [decodedRedirectPath, setDecodedRedirectPath] = useState('/');

  // If user is set, call onSuccess
  useEffect(() => {
    if (user && onSuccess) {
      onSuccess();
    }
  }, [user, onSuccess]);

  // Check for URL error parameter
  useEffect(() => {
    const urlError = searchParams?.get('error');
    if (urlError) {
      const errorMessage = urlError.replace(/_/g, ' ').toLowerCase();
      setLocalError(errorMessage);
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });

      // Remove error from URL
      if (searchParams) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete('error');
        const newPath =
          window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
        router.replace(newPath);
      }
    }
  }, [searchParams, toast, router]);

  // Decode redirect path
  useEffect(() => {
    try {
      let decoded = redirectPath;
      if (redirectPath.includes('%')) {
        decoded = decodeURIComponent(redirectPath);
      }

      // Ensure path starts with slash if relative
      if (!decoded.startsWith('/') && !decoded.startsWith('http')) {
        decoded = '/' + decoded;
      }

      setDecodedRedirectPath(decoded);
    } catch (e) {
      console.error('Error decoding redirect path:', e);
      setDecodedRedirectPath('/');
    }
  }, [redirectPath]);

  // Add a retry handler
  const handleRetry = async () => {
    setLocalError(null);

    try {
      // First, try to refresh auth state
      await refreshSession();

      // Then try to sign in again
      await signIn(email, password);

      // Call onSuccess if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Retry login error:', error);
      setLocalError('Login retry failed. Please check your network connection and try again.');

      // Show a toast with more info
      toast({
        title: 'Authentication Error',
        description: 'Login failed after retry. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      console.log('Attempting sign in...');

      await signIn(email, password);
      // Call onSuccess if provided (the user check in useEffect will also handle this)
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Login error:', error);
      setRetryCount((prev) => prev + 1);

      // Format user-friendly error message
      let errorMessage = 'An error occurred during login. Please try again.';

      if (error instanceof Error) {
        if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('Invalid email or password')
        ) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }

      setLocalError(errorMessage);

      // Show toast for persistent errors
      if (errorMessage.includes('rate limit') || errorMessage.includes('service')) {
        toast({
          title: 'Login Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      // Create browser client directly for social login
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      if (!supabase) {
        throw new Error('Authentication service not available');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(decodedRedirectPath)}`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      setLocalError(
        error instanceof Error ? error.message : 'Failed to sign in with Google. Please try again.'
      );

      toast({
        title: 'Google Sign In Failed',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

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
          className="w-full flex items-center gap-2 h-12 rounded-full bg-white border border-gray-200 shadow-sm text-base font-semibold text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          aria-label="Sign in with Google"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
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

      <motion.div variants={fadeIn} className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or continue with</span>
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        variants={slideUp}
        aria-label="Sign in form"
      >
        <motion.div variants={fadeIn} className="space-y-2">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 rounded-xl px-4 text-base shadow-sm"
            aria-label="Email address"
          />
        </motion.div>
        <motion.div variants={fadeIn} className="space-y-2">
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-10 rounded-xl px-4 text-base shadow-sm"
              aria-label="Password"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-2">
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline"
              tabIndex={0}
              aria-label="Forgot Password?"
            >
              Forgot Password?
            </Link>
          </div>
        </motion.div>
        <motion.div variants={fadeIn} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="w-full gap-1 h-10 rounded-full text-base font-semibold shadow-md"
            disabled={isLoading}
            aria-label="Sign In"
          >
            {isLoading ? (
              'Signing In...'
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                {primaryButtonText}
              </>
            )}
          </Button>
        </motion.div>
        {localError && (
          <motion.div
            variants={fadeIn}
            className="text-destructive text-sm mt-2 text-center"
            role="alert"
            aria-live="polite"
          >
            <div>{localError}</div>
            {retryCount > 0 && !localError.includes('Invalid email or password') && (
              <Button
                variant="link"
                size="sm"
                className="px-0 text-primary hover:underline"
                onClick={handleRetry}
                disabled={isLoading}
              >
                Try again with a network refresh
              </Button>
            )}
          </motion.div>
        )}
      </motion.form>
    </motion.div>
  );
}
