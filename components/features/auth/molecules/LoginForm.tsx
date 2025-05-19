import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import PasswordField from '@/components/features/auth/atoms/PasswordField';
import { SubmitButton } from '@/components/shared/atoms/buttons/SubmitButton';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

export type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  error?: string;
}

/**
 * LoginForm - A form for user authentication
 * 
 * This is a molecule component in the auth feature that uses:
 * - PasswordField atom (feature-specific)
 * - SubmitButton atom (shared)
 */
const LoginForm = ({ onSubmit, error }: LoginFormProps) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await onSubmit(values);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  autoComplete="email"
                  {...field} 
                />
              </FormControl>
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
              <FormControl>
                <PasswordField 
                  placeholder="Enter your password" 
                  autoComplete="current-password"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <SubmitButton
          className="w-full"
          isLoading={isSubmitting}
          loadingText="Logging in..."
        >
          Log In
        </SubmitButton>
      </form>
    </div>
  );
};

export default LoginForm; 