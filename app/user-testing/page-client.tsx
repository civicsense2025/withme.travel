'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthDebugger from '@/components/auth-debugger';
import { 
  UserResearchHero, 
  BenefitsList, 
  UserResearchForm, 
  PrivacyConsent
} from '@/components/research';
import clientGuestUtils, { getGuestToken } from '@/utils/guest';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Constants for the user testing page
const HERO_HEADLINE = '✈️ Join us in reimagining group travel';
const HERO_SUBHEAD =
  'Get early access to withme.travel and help shape how friends plan adventures together. Be part of our community building the future of trip planning.';
const BENEFITS = [
  { emoji: '🔍', text: 'First look at new features before anyone else' },
  { emoji: '🗺️', text: 'Shape our roadmap with your real travel insights' },
  { emoji: '🤝', text: 'Connect with fellow adventure planners' },
  { emoji: '✨', text: 'Enjoy a free lifetime plan as an alpha tester' },
];
const PRIVACY_SUMMARY =
  'We respect your privacy. Your info is only used for the user testing program. Opt out anytime.';

// Helper function to completely logout a user from the testing system
export const performCompleteLogout = () => {
  console.log('[UserTesting] Performing complete logout');
  
  // Clear localStorage tokens
  localStorage.removeItem('authToken');
  localStorage.removeItem('userTestingEmail');
  
  // Clear guest token
  clientGuestUtils.clearToken();
  
  // Clear cookies that might contain tokens
  document.cookie = 'guest_token=; Max-Age=0; path=/; SameSite=Lax';
  document.cookie = 'auth_token=; Max-Age=0; path=/; SameSite=Lax';
  document.cookie = 'sb-auth-token=; Max-Age=0; path=/; SameSite=Lax';
  document.cookie = 'supabase-auth-token=; Max-Age=0; path=/; SameSite=Lax';
  
  // Force update session storage
  sessionStorage.clear();
  
  // Make sure token is invalidated on server
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }).catch(err => {
    console.error('[UserTesting] Error during server logout:', err);
  });
  
  console.log('[UserTesting] Logout complete, all tokens cleared');
};

/**
 * Client component for the user testing signup page
 * Automatically redirects to survey page if user is already authenticated
 */
export default function UserTestingClient() {
  const router = useRouter();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  // On mount, check auth and auto-login if possible
  useEffect(() => {
    const checkAuthAndAutoLogin = async () => {
      // 1. If already authenticated, redirect
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        router.push('/user-testing/survey');
        return;
      }
      // 2. Try to get stored email
      let storedEmail = localStorage.getItem('userTestingEmail') || '';
      if (!storedEmail && email) storedEmail = email;
      if (!storedEmail) {
        setShowSignupForm(true);
        return;
      }
      setEmail(storedEmail);
      setIsLoading(true);
      // 3. Lookup user
      try {
        const lookupRes = await fetch(`/api/user-testing-lookup?email=${encodeURIComponent(storedEmail)}`);
        const lookupData = await lookupRes.json();
        if (lookupData.exists) {
          // Auto-login
          const loginRes = await fetch('/api/user-testing-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: storedEmail }),
          });
          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.token) {
            localStorage.setItem('authToken', loginData.token);
            localStorage.setItem('userTestingEmail', storedEmail);
            setSuccessMessage('Welcome back! Logging you in...');
            setShowSuccess(true);
            setTimeout(() => {
              router.push('/user-testing/survey');
            }, 1500);
            return;
          } else {
            setError(loginData.error || 'Login failed.');
            setShowSignupForm(true);
          }
        } else {
          // Not registered, show signup
          setShowSignupForm(true);
        }
      } catch (err) {
        setError('Network error.');
        setShowSignupForm(true);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthAndAutoLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manual login handler for the login modal
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    console.log('[UserTesting] Login attempt with email:', email);
    
    try {
      console.log('[UserTesting] Sending login request to /api/user-testing-login');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/user-testing-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('[UserTesting] Login response status:', response.status);
      
      const data = await response.json();
      console.log('[UserTesting] Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      if (data.token) {
        console.log('[UserTesting] Login successful, storing token and redirecting');
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userTestingEmail', email);
        setSuccessMessage('Successfully signed in! Redirecting...');
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/user-testing/survey');
        }, 1500);
      } else {
        console.log('[UserTesting] Login response missing token');
        setError('Login failed - no token received.');
      }
    } catch (err: unknown) {
      console.error('[UserTesting] Login error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Login request timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col font-sans">
      {/* Hero section with headline and subheading */}
      <UserResearchHero headline={HERO_HEADLINE} subheadline={HERO_SUBHEAD}>
        {/* Only show signup form if not registered */}
        {showSignupForm && (
          <UserResearchForm 
            submitUrl="/api/user-testing-signup"
            redirectUrl="/user-testing/survey"
            submitButtonText="Join the Alpha Program"
            loadingText="Signing you up…"
            onSuccess={(data) => {
              if (data.guestToken || data.token) {
                localStorage.setItem('authToken', data.guestToken || data.token);
                localStorage.setItem('userTestingEmail', data.email || email);
                setSuccessMessage('Successfully signed up! Redirecting...');
                setShowSuccess(true);
                setTimeout(() => {
                  router.push('/user-testing/survey');
                }, 1500);
              }
            }}
            onError={(err) => {
              setError(err instanceof Error ? err.message : 'Signup failed');
            }}
          />
        )}
        
        {/* Login link for fallback/manual login */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setLoginModalOpen(true)}
            className="text-sm text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            Already signed up for user testing? Sign in
          </button>
        </div>
        
        {/* Benefits list */}
        <BenefitsList benefits={BENEFITS} />
        
        {/* Privacy consent */}
        <PrivacyConsent message={PRIVACY_SUMMARY} />
      </UserResearchHero>
      
      {/* Login Modal */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Sign in to Access Your Surveys</DialogTitle>
            <DialogDescription>
              Enter your email to access your user testing surveys.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-2">
              <div className="grid gap-1">
                <Label className="sr-only" htmlFor="email">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Email address"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button disabled={isLoading || !email}>
                {isLoading && (
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign In
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up Successful</DialogTitle>
            <DialogDescription>
              Thank you for signing up! You'll be redirected to the survey shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <Spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-center text-sm text-gray-600">{successMessage}</p>
        </DialogContent>
      </Dialog>
      
      {/* Footer */}
      <footer className="py-6 text-sm text-muted-foreground text-center w-full border-t border-border">
        Powered by{' '}
        <span className="font-semibold text-primary">
          withme.travel
        </span>
      </footer>
      
      {/* Add auth debugger for development */}
      {process.env.NODE_ENV !== 'production' && <AuthDebugger />}
    </main>
  );
}
