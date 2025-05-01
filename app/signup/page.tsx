'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { AuthSellingPoints } from '@/components/auth-selling-points';
import { createClient } from '@/utils/supabase/client';
import { Spinner } from '@/components/ui/spinner';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [signupContext, setSignupContext] = useState<string | null>(null);

  const supabase = createClient();

  // Get invitation token or referral code from URL
  const invitationToken = searchParams.get('invitation');
  const referralCode = searchParams.get('ref');
  const redirectParam = searchParams.get('redirect');

  // Pre-fill email if coming from invitation
  useEffect(() => {
    if (invitationToken) {
      // Fetch invitation details to get the email
      async function getInvitationDetails() {
        try {
          const response = await fetch(`/api/invitations/${invitationToken}`);
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

    // Detect where the user is coming from and provide appropriate context
    if (redirectParam) {
      if (redirectParam.includes('/trips/create')) {
        setSignupContext('to create a new trip');
      } else if (redirectParam.includes('/trips')) {
        setSignupContext('to access trips');
      } else if (redirectParam.includes('/saved')) {
        setSignupContext('to save your favorite places');
      }
    }
  }, [invitationToken, redirectParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sign up directly using Supabase client
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          // Pass name/username in options.data if needed for profile/metadata
          // This depends on how your Supabase project/triggers are set up.
          // If profile is created via API route after confirmation, this might not be needed here.
          data: {
            name: formData.name || formData.email.split('@')[0], // Example: Pass name
          },
        },
      });

      if (signUpError) {
        throw signUpError; // Throw the error to be caught below
      }

      // Check if email confirmation is required
      if (data.user && !data.user.email_confirmed_at) {
        setSuccess(true); // Show success message about checking email
        toast({
          title: 'account created!',
          description: 'please check your email to verify your account.',
        });
      } else if (data.user) {
        // User created and possibly auto-confirmed (or confirmation disabled)
        // We might still show the email check message for consistency,
        // or directly proceed as if logged in (though /api/auth/me handles profile fetch).
        setSuccess(true);
        toast({
          title: 'account created!',
          description: 'signup successful! you may need to verify your email.',
        });
      } else {
        // Handle case where sign up returns no user and no error (unlikely but possible)
        throw new Error('Signup completed but no user data received.');
      }

      // Clear form only on success
      setFormData({
        name: '',
        email: '',
        password: '',
      });

      // --- Invitation acceptance can be handled in the callback or after first login ---
      // Removing immediate invitation acceptance here as it requires the user to be logged in,
      // which might not be the case if email verification is needed.
      // The callback route already handles invitations for OAuth sign-ins.
      // For email signups, accepting after first login might be more robust.
    } catch (error: any) {
      console.error('Signup error:', error);
      let errorMessage = 'an error occurred during signup';
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'an account with this email already exists.';
        } else if (error.message.includes('Password should be at least 6 characters')) {
          errorMessage = 'password must be at least 6 characters long';
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
      toast({
        title: 'signup failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGoogleSignIn() {
    try {
      setIsGoogleLoading(true);

      // Get the redirect URL from search params or default to home
      const redirectUrl = searchParams.get('redirect') || '/';

      // Construct the callback URL base
      const callbackUrl = new URL('/auth/callback', window.location.origin);

      // Append existing search params from the signup page (like redirect, ref, invitation) to the callback
      searchParams.forEach((value, key) => {
        callbackUrl.searchParams.append(key, value);
      });
      // Ensure the intended final redirect is included if not already present
      if (!callbackUrl.searchParams.has('redirect')) {
        callbackUrl.searchParams.set('redirect', redirectUrl);
      }

      console.log('Google Sign-In redirectTo:', callbackUrl.toString()); // For debugging

      // Initiate Google OAuth sign-in using Supabase client
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
          //queryParams: { // Optional: Add any extra params if needed by Supabase
          //  invitation: invitationToken || '',
          //  ref: referralCode || ''
          //}
        },
      });

      if (error) {
        throw error; // Throw error to be caught below
      }
      // Note: No need to handle redirect here, Supabase handles it.
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        title: 'Google sign-in failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
      setIsGoogleLoading(false); // Ensure loading state is reset on error
    }
    // No finally block needed here, loading state reset on error
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-0">
      <div className="w-full max-w-md flex flex-col">
        <div className="md:hidden mb-6">
          <AuthSellingPoints />
        </div>

        <Card className="border border-border/10 dark:border-border/10 shadow-xl dark:shadow-2xl dark:shadow-black/20">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl font-bold text-center">create an account</CardTitle>
            <CardDescription className="text-center">
              {invitationToken ? (
                'join withme.travel and accept your trip invitation'
              ) : signupContext ? (
                <>join withme.travel {signupContext}</>
              ) : (
                'join withme.travel and start planning adventures with friends'
              )}
            </CardDescription>
          </CardHeader>

          {success ? (
            <CardContent className="space-y-4">
              <Alert className="border-border/20 dark:border-border/10">
                <AlertDescription>
                  <p className="font-medium">account created successfully!</p>
                  <p className="mt-2">
                    we've sent a verification email to{' '}
                    <span className="font-medium">{formData.email}</span>. please check your inbox
                    and click the verification link to activate your account.
                  </p>
                </AlertDescription>
              </Alert>
              <div className="flex flex-col space-y-2 mt-4">
                <Button asChild className="bg-primary/90 hover:bg-primary">
                  <Link href="/login">go to login</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-border/20 dark:border-border/10 hover:bg-muted/50"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email (Refresh)
                </Button>
              </div>
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              {error && (
                <Alert
                  variant="destructive"
                  className="border-destructive/20 dark:border-destructive/10 bg-destructive/5"
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="your name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="password">password</Label>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="pr-10 bg-background/50"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-1 right-1 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1} // Prevent tabbing to this button
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary/90 hover:bg-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Spinner size="sm" showText text="please wait..." />
                  ) : (
                    'create account'
                  )}
                </Button>
              </form>

              {/* Separator */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/20 dark:border-border/10"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              {/* Google Sign-in */}
              <Button
                variant="outline"
                className="w-full border-border/20 dark:border-border/10 hover:bg-muted/50"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Spinner size="sm" showText text="please wait..." />
                ) : (
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 261.8 0 120.8 109.8 11.8 244 11.8c70.3 0 129.8 27.7 174.2 71.8l-64.5 62.3C314.5 118.4 282.8 103 244 103c-66.8 0-121.4 54.6-121.4 121.8s54.6 121.8 121.4 121.8c76.3 0 98.8-48.2 103-74.6H244v-81h244.5c2.5 13.7 4.5 29.1 4.5 46.8z"
                    ></path>
                  </svg>
                )}
                sign up with google
              </Button>
            </CardContent>
          )}

          <CardFooter className="flex justify-center">
            <p className="text-center text-sm text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy. Already
              have an account?{' '}
              <Link
                href={
                  redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : '/login'
                }
                className="text-primary hover:underline font-medium"
              >
                sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="hidden md:block mt-8">
          <AuthSellingPoints />
        </div>
      </div>
    </div>
  );
}
