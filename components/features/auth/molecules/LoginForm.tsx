
/**
 * LoginForm - A form for user authentication
 * 
 * This is a molecule component in the auth feature that uses:
 * - PasswordField atom (feature-specific)
 * - SubmitButton atom (shared)
 */

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import PasswordField from '@/components/features/auth/atoms/PasswordField';
import { SubmitButton } from '@/components/shared/atoms/buttons/SubmitButton';
import { useAuth } from '@/lib/hooks/use-auth';
import { AuthError } from '../atoms/AuthError';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => Promise<void>;
  error?: string;
}


const LoginForm = ({ onSubmit, error: errorProp }: LoginFormProps) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { login, isLoading, error } = useAuth();
  const isSubmitting = form.formState.isSubmitting || isLoading;

  const handleSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await login(values.email, values.password);
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="space-y-4">
      {(errorProp || error) && <AuthError message={errorProp || error?.message || ''} />}
      <Form form={form} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                autoComplete="email"
                {...field} 
                disabled={isSubmitting}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <PasswordField 
                placeholder="Enter your password" 
                autoComplete="current-password"
                {...field} 
                disabled={isSubmitting}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton
          className="w-full"
          isLoading={isSubmitting}
          loadingText="Logging in..."
        >
          Log In
        </SubmitButton>
      </Form>
    </div>
  );
};

export default LoginForm;