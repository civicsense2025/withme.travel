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

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { signIn, isLoading, error: authError, refreshAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Get and process redirect path
  const redirectPath = searchParams.get('redirect') || '/';
  const [decodedRedirectPath, setDecodedRedirectPath] = useState('/');

  // Check for URL error parameter
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      const errorMessage = urlError.replace(/_/g, ' ').toLowerCase();
      setLocalError(errorMessage);
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });

      // Remove error from URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('error');
      const newPath =
        window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
      router.replace(newPath);
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
      await refreshAuth();
      
      // Then try to sign in again
      await signIn(email, password);
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
      
      // Clear any previous errors
      if (authError) {
        console.log('Clearing previous auth error before sign in');
      }

      await signIn(email, password);
      // Auth provider will handle the session, and router will redirect in parent component
    } catch (error) {
      console.error('Login error:', error);
      setRetryCount(prev => prev + 1);
      
      // Format user-friendly error message
      let errorMessage = 'An error occurred during login. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Invalid email or password')) {
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

  // Display auth errors from context
  useEffect(() => {
    if (authError) {
      setLocalError(authError.message);
    }
  }, [authError]);

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
          <span className="bg-background px-2 text-muted-foreground lowercase">
            or continue with
          </span>
        </div>
      </motion.div>

      <motion.form onSubmit={handleSubmit} className="space-y-4" variants={slideUp}>
        <motion.div variants={fadeIn} className="space-y-2">
          <Label htmlFor="email">email</Label>
          <Input
            id="email"
            type="email"
            placeholder="hello@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </motion.div>
        <motion.div variants={fadeIn} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline lowercase"
            >
              forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
        <motion.div variants={fadeIn} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" className="w-full gap-1 lowercase" disabled={isLoading}>
            {isLoading ? (
              'signing in...'
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                sign in
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
