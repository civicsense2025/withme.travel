'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import clientGuestUtils from '@/utils/guest';

export interface UserResearchFormData {
  name: string;
  email: string;
}

export interface UserResearchFormProps {
  /**
   * The URL to submit the form data to
   * @default '/api/user-testing-signup'
   */
  submitUrl?: string;
  
  /**
   * The URL to redirect to on successful submission
   * @default '/user-testing/survey'
   */
  redirectUrl?: string;
  
  /**
   * Text to display on the submit button
   * @default 'Join the Alpha Program'
   */
  submitButtonText?: string;
  
  /**
   * Loading text to display while the form is submitting
   * @default 'Signing you up…'
   */
  loadingText?: string;
  
  /**
   * Delay in milliseconds before redirecting after successful submission
   * @default 1500
   */
  redirectDelay?: number;
  
  /**
   * Additional CSS class for the form
   */
  className?: string;
  
  /**
   * Function to call on successful submission
   */
  onSuccess?: (data: any) => void;
  
  /**
   * Function to call on submission error
   */
  onError?: (error: Error) => void;
}

/**
 * Form component for user research signup
 */
export function UserResearchForm({
  submitUrl = '/api/user-testing-signup',
  redirectUrl = '/user-testing/survey',
  submitButtonText = 'Join the Alpha Program',
  loadingText = 'Signing you up…',
  redirectDelay = 1500,
  className = '',
  onSuccess,
  onError,
}: UserResearchFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<UserResearchFormData>({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Form validation
    if (!form.name.trim() || !form.email.trim()) {
      const errorMessage = 'Please enter your name and email.';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('Failed to sign up. Please try again.');
      }

      const data = await res.json();

      // Save form data and guest token using clientGuestUtils
      clientGuestUtils.saveUserTestingData(form);
      
      // Generate a guest token if not provided by the API
      const guestToken = data.guestToken || clientGuestUtils.generateToken();
      clientGuestUtils.saveToken(guestToken);

      // Show success message
      setSuccess(true);
      
      // Call success callback
      onSuccess?.(data);
      
      // Redirect after delay
      if (redirectUrl) {
        setTimeout(() => {
          router.push(redirectUrl);
        }, redirectDelay);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong.';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center py-10 px-4">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-6">
          <span className="text-4xl" role="img" aria-label="Success">
            ✅
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">You're in!</h2>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-6 max-w-sm">
          Thanks for joining our research program. We'll be in touch soon with next steps!
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-sm mx-auto flex flex-col gap-6 mb-10 ${className}`}
    >
      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Your name
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Jane Smith"
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          required
          className="rounded-xl h-12 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 shadow-sm focus:ring-2 focus:ring-primary dark:focus:ring-primary dark:text-white"
          autoComplete="name"
        />
      </div>
      
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jane@example.com"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          required
          className="rounded-xl h-12 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-800 shadow-sm focus:ring-2 focus:ring-primary dark:focus:ring-primary dark:text-white"
          autoComplete="email"
        />
      </div>
      
      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-gray-900/80 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}
      
      <Button
        type="submit"
        size="lg"
        className="rounded-full bg-gradient-to-r from-purple-400 via-pink-300 to-yellow-300 text-white font-bold text-lg py-6 mt-2 shadow-md animate-subtle-glow hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-0"
        disabled={loading}
      >
        {loading ? loadingText : submitButtonText}
      </Button>
    </form>
  );
} 