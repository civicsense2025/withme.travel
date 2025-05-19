'use client';

/**
 * Signup Form Component
 * 
 * A clean, modern signup form with social signup options
 */

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
import { SignupFormProps } from './types';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Clean, modern signup form with social signup options
 */
export function SignupForm({
  onSuccess,
  primaryButtonText = 'Create Account',
  redirectAfterSignup = true,
  redirectUrl = '/onboarding',
  showLoginLink = true,
  loginLinkText = 'Already have an account? Log in',
  className = '',
}: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  // Form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Field validation states
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    terms?: string;
  }>({});

  // Check for invitation or referral token
  useEffect(() => {
    const invitationToken = searchParams?.get('invitation');
    const email = searchParams?.get('email');
    
    if (email) {
      setEmail(email);
    }
    
    if (invitationToken) {
      // Fetch invitation details if needed
      const fetchInvitationDetails = async () => {
        try {
          const response = await fetch(`/api/invitations/${invitationToken}`);
          if (response.ok) {
            const data = await response.json();
            if (data.invitation?.email && !email) {
              setEmail(data.invitation.email);
            }
          }
        } catch (error) {
          console.error('Error fetching invitation details:', error);
        }
      };
      
      fetchInvitationDetails();
    }
  }, [searchParams]);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength('');
      return '';
    }
    
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    
    const score = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;
    
    if (score < 3) return 'weak';
    if (score < 5) return 'medium';
    return 'strong';
  };
  
  // Handle password change with strength check
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign up with email/password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
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
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectAfterSignup) {
        router.push(redirectUrl);
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

  // Handle Google sign up
  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      
      // Construct callback URL with any existing search params
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      
      // Add search params
      searchParams?.forEach((value, key) => {
        callbackUrl.searchParams.append(key, value);
      });
      
      // Ensure redirect is included
      if (!callbackUrl.searchParams.has('redirect')) {
        callbackUrl.searchParams.set('redirect', redirectUrl);
      }
      
      // Add terms acceptance indicator to the callback URL
      callbackUrl.searchParams.set('terms_accepted', 'true');
      
      // Initiate Google OAuth sign-up
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Google sign-up error:', error);
      toast({
        title: 'Google Sign-up Failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
      setIsGoogleLoading(false);
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
        <h1 className="text-2xl font-bold">Create Your Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Join withme.travel and start planning your next adventure
        </p>
      </motion.div>
      
      {/* Google Sign Up Button */}
      <motion.div variants={fadeIn}>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2 h-12 rounded-full bg-white border border-gray-200 shadow-sm text-base font-semibold text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          aria-label="Sign up with Google"
          onClick={handleGoogleSignUp}
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
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or sign up with email
          </span>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          variants={fadeIn}
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* Email/Password Form */}
      <motion.form variants={fadeIn} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive mt-1">
              {errors.name}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive mt-1">
              {errors.email}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              required
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {passwordStrength && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      passwordStrength === 'weak'
                        ? 'w-1/3 bg-red-500'
                        : passwordStrength === 'medium'
                        ? 'w-2/3 bg-yellow-500'
                        : 'w-full bg-green-500'
                    }`}
                  />
                </div>
                <span
                  className={`text-xs ${
                    passwordStrength === 'weak'
                      ? 'text-red-500'
                      : passwordStrength === 'medium'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  }`}
                >
                  {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                </span>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive mt-1">
              {errors.password}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground mt-1">
            Password must be at least 8 characters long
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
              aria-invalid={!!errors.terms}
              aria-describedby={errors.terms ? 'terms-error' : undefined}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-normal flex gap-1 flex-wrap"
              >
                I agree to the
                <Link
                  href="/terms"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>
                and
                <Link
                  href="/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </Label>
              
              {errors.terms && (
                <p id="terms-error" className="text-sm text-destructive">
                  {errors.terms}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full h-11"
          disabled={isLoading || isGoogleLoading}
        >
          {isLoading ? 'Creating Account...' : primaryButtonText}
        </Button>
      </motion.form>

      {/* Login Link */}
      {showLoginLink && (
        <motion.div variants={fadeIn} className="text-center text-sm">
          <span className="text-muted-foreground">
            {loginLinkText.split('Log in')[0]}
          </span>{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
} 