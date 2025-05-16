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
import clientGuestUtils from '@/utils/guest';
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

/**
 * Client component for the user testing signup page
 * Automatically redirects to survey page if user is already authenticated
 */
export default function UserTestingClient() {
  const router = useRouter();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already authenticated and redirect them
  useEffect(() => {
    // Get existing token from localStorage
    const existingToken = clientGuestUtils.getToken();
    
    // If token exists, user is already signed up - redirect to survey page
    if (existingToken) {
      console.log('User already has a token, redirecting to surveys');
      router.push('/user-testing/survey');
    }
  }, [router]);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Call auth API to log in
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Check if user has an existing user testing session
      // We'll check this server-side and redirect appropriately
      router.push('/user-testing/survey');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col font-sans">
      {/* Hero section with headline and subheading */}
      <UserResearchHero headline={HERO_HEADLINE} subheadline={HERO_SUBHEAD}>
        {/* Signup form */}
        <UserResearchForm 
          submitUrl="/api/user-testing-signup"
          redirectUrl="/user-testing/survey"
          submitButtonText="Join the Alpha Program"
          loadingText="Signing you up…"
        />
        
        {/* Login link for returning users */}
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
              Enter your email and password to access your user testing surveys.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
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
