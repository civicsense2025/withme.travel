'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/hooks/use-toast';
import { fadeIn, staggerContainer } from '@/utils/animation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [formState, setFormState] = useState<{
    status: 'idle' | 'submitting' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Check for token in URL
  useEffect(() => {
    const token = searchParams?.get('token');
    if (!token) {
      toast({
        title: 'Missing Token',
        description: 'No reset token found. Please request a new password reset link.',
        variant: 'destructive',
      });
      setFormState({
        status: 'error',
        message: 'No reset token found. Please request a new password reset link.',
      });
    } else {
      setToken(token);
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset state
    setFormState({ status: 'idle', message: '' });

    // Client-side validation
    if (password !== confirmPassword) {
      setFormState({
        status: 'error',
        message: 'Passwords do not match',
      });
      return;
    }

    if (password.length < 8) {
      setFormState({
        status: 'error',
        message: 'Password must be at least 8 characters',
      });
      return;
    }

    // Check for uppercase, lowercase, and number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setFormState({
        status: 'error',
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      });
      return;
    }

    setFormState({ status: 'submitting', message: '' });

    try {
      // Use the Supabase client directly
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();

      if (!supabase) {
        throw new Error('Authentication service not available');
      }

      // Update user's password
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      // Show success message
      setFormState({
        status: 'success',
        message: 'Your password has been successfully reset',
      });

      setPassword('');
      setConfirmPassword('');

      toast({
        title: 'Password Reset',
        description: 'Your password has been successfully reset.',
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        return router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);

      setFormState({
        status: 'error',
        message: error.message || 'Failed to reset password',
      });

      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
          <p className="text-muted-foreground">Enter your new password below</p>
        </motion.div>

        {formState.status === 'error' && (
          <motion.div
            variants={fadeIn}
            className="bg-destructive/10 text-destructive p-3 rounded-md text-sm"
          >
            {formState.message}
          </motion.div>
        )}

        {formState.status === 'success' ? (
          <motion.div
            variants={fadeIn}
            className="bg-green-100 text-green-800 p-4 rounded-md text-center"
          >
            <p className="font-medium">Password reset successful!</p>
            <p className="text-sm mt-1">You will be redirected to the login page in a moment.</p>
          </motion.div>
        ) : (
          <motion.form variants={fadeIn} className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                  disabled={formState.status === 'submitting'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={formState.status === 'submitting'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                  disabled={formState.status === 'submitting'}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={formState.status === 'submitting' || !token}
            >
              {formState.status === 'submitting' ? (
                'Resetting Password...'
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
  );
}
