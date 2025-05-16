'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import { fadeIn, slideUp, staggerContainer } from '@/utils/animation';
import { TermsDialog } from '@/components/terms-dialog';
import { PrivacyDialog } from '@/components/privacy-dialog';

interface SignupFormProps {
  /** Optional callback function to call when signup is successful */
  onSuccess?: () => void;
  /** Optional custom text for the primary button */
  primaryButtonText?: string;
}

export function SignupForm({ onSuccess, primaryButtonText = 'Sign Up' }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  const supabase = createClient();

  // Get invitation token or referral from URL
  useEffect(() => {
    const token = searchParams?.get('invitation');
    if (token) {
      setInvitationToken(token);
      // Fetch invitation details to get the email
      async function getInvitationDetails() {
        try {
          const response = await fetch(`/api/invitations/${token}`);
          if (response.ok) {
            const data = await response.json();
            if (data.invitation?.email) {
              setFormData((prev) => ({
                ...prev,
                email: data.invitation.email,
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching invitation details:', error);
        }
      }
      getInvitationDetails();
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!termsAgreed) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Sign up directly using Supabase client
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name || formData.email.split('@')[0],
            terms_accepted: true, // Record terms acceptance
            terms_accepted_at: new Date().toISOString(),
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: 'Account Created!',
          description: 'Please check your email to verify your account.',
        });
      } else if (data.user) {
        toast({
          title: 'Account Created!',
          description: 'Signup successful! You may need to verify your email.',
        });
      } else {
        throw new Error('Signup completed but no user data received.');
      }

      // Clear form on success
      setFormData({
        name: '',
        email: '',
        password: '',
      });

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'An error occurred during signup';

      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists.';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'Password must be at least 6 characters long';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);

      // Get redirect URL from search params or default to home
      const redirectUrl = searchParams?.get('redirect') || '/';

      // Construct callback URL with existing params
      const callbackUrl = new URL('/auth/callback', window.location.origin);

      // Append search params
      searchParams?.forEach((value, key) => {
        callbackUrl.searchParams.append(key, value);
      });

      // Ensure redirect is included
      if (!callbackUrl.searchParams.has('redirect')) {
        callbackUrl.searchParams.set('redirect', redirectUrl);
      }

      // Add terms acceptance indicator to the callback URL
      callbackUrl.searchParams.set('terms_accepted', 'true');

      // Initiate Google OAuth sign-in
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        throw error;
      }
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
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Google Sign In Button */}
      <motion.div variants={fadeIn}>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2 h-12 rounded-full bg-white border border-gray-200 shadow-sm text-base font-semibold text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          aria-label="Sign up with Google"
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
          Sign up with Google
        </Button>
      </motion.div>

      {/* Divider */}
      <motion.div variants={fadeIn} className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
        </div>
      </motion.div>

      {/* Signup Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4"
        variants={slideUp}
        aria-label="Sign up form"
      >
        {/* Name field */}
        <motion.div variants={fadeIn} className="space-y-2">
          <Label htmlFor="name" className="sr-only">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="h-10 rounded-xl px-4 text-base shadow-sm"
            aria-label="Your name"
          />
        </motion.div>

        {/* Email field */}
        <motion.div variants={fadeIn} className="space-y-2">
          <Label htmlFor="email" className="sr-only">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="h-10 rounded-xl px-4 text-base shadow-sm"
            aria-label="Email address"
          />
        </motion.div>

        {/* Password field */}
        <motion.div variants={fadeIn} className="space-y-2">
          <Label htmlFor="password" className="sr-only">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
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
        </motion.div>

        {/* Terms Agreement Checkbox */}
        <motion.div variants={fadeIn} className="space-y-2">
          <div className="flex items-start">
            <Checkbox
              id="terms"
              checked={termsAgreed}
              onCheckedChange={(checked) => {
                setTermsAgreed(checked === true);
              }}
              className="mt-1 h-4 w-4"
            />
            <Label htmlFor="terms" className="text-xs text-muted-foreground ml-2 font-normal">
              I agree to the&nbsp;
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setTermsDialogOpen(true)}
              >
                Terms of Service
              </button>
              &nbsp;and&nbsp;
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setPrivacyDialogOpen(true)}
              >
                Privacy Policy
              </button>
            </Label>
          </div>
        </motion.div>

        {/* Submit button */}
        <motion.div variants={fadeIn} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            className="w-full gap-1 h-10 rounded-full text-base font-semibold shadow-md"
            disabled={isLoading || isGoogleLoading}
            aria-label="Sign Up"
          >
            {isLoading ? (
              'Signing Up...'
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                {primaryButtonText}
              </>
            )}
          </Button>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            variants={fadeIn}
            className="text-destructive text-sm mt-2 text-center"
            role="alert"
            aria-live="polite"
          >
            {error}
          </motion.div>
        )}
      </motion.form>

      {/* Terms of Service Dialog */}
      <TermsDialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen} />

      {/* Privacy Policy Dialog */}
      <PrivacyDialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen} />
    </motion.div>
  );
}
