/**
 * LoginForm - A form for user authentication
 * 
 * This is a molecule component in the auth feature that uses:
 * - React Hook Form for validation and state management
 * - PasswordField atom with strength checking
 * - Comprehensive accessibility features
 */

'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AuthError } from '../atoms/AuthError';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';

// Form validation schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSubmit?: SubmitHandler<LoginFormValues>;
  error?: string;
}

export function LoginForm({ onSubmit, error: errorProp }: LoginFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
  });

  const supabase = createClient();

  const handleFormSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    if (onSubmit) {
      return onSubmit(data);
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setError('root', { message: error.message });
      }
    } catch (err) {
      setError('root', { 
        message: 'An unexpected error occurred. Please try again.' 
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          {...register('email')}
        />
        {formState.errors.email && (
          <p className="text-sm text-red-500">{formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('password')}
        />
        {formState.errors.password && (
          <p className="text-sm text-red-500">{formState.errors.password.message}</p>
        )}
      </div>

      {errorProp && <AuthError message={errorProp} />}

      <div className="flex items-center justify-between">
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}

export default LoginForm;