'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';

// Utility function to get a random image - in a real app, you'd implement this properly
const getRandomImage = () => {
  const images = [
    '/images/destinations/barcelona.jpg',
    '/images/destinations/paris.jpg',
    '/images/destinations/tokyo.jpg',
    '/images/destinations/new-york.jpg',
  ];
  return images[Math.floor(Math.random() * images.length)];
};

export default function ReferralInvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [referral, setReferral] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [coverUrl, setCoverUrl] = useState<string>(getRandomImage());

  const token = params?.token;

  // Fetch user auth state and referral details
  useEffect(() => {
    async function fetchUserAndReferral() {
      if (!token) {
        setError('Referral token is missing.');
        setIsLoading(false);
        return;
      }

      try {
        // Check auth state
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

        // If user is already logged in, we'll show a different action
        if (user) {
          setIsLoading(false);
          return;
        }

        // Fetch referral details
        const response = await fetch(`/api/invitations/referral/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('This referral link is invalid or has expired');
            return;
          }
          throw new Error(`Failed to verify referral: ${response.status}`);
        }

        const data = await response.json();
        setReferral(data.referral);
      } catch (err: any) {
        console.error('Error checking referral:', err);
        setError(err.message || 'Failed to verify referral');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserAndReferral();
  }, [token, supabase]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  // Loading state
  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-purple mb-4" />
          <p className="text-muted">Verifying referral...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-surface-light dark:bg-surface-light/10">
        <div className="max-w-xl mx-auto py-16 px-6 text-center">
          <h1 className="text-3xl font-extrabold mb-4">This invite has expired</h1>
          <p className="text-lg text-muted mb-8">
            {error ||
              'This referral link is invalid or has expired. If you think this is a mistake, ask your friend to send a new one!'}
          </p>
          <a href="/" className="text-accent-purple font-medium underline">
            Back to home
          </a>
        </div>
      </main>
    );
  }

  // Default values if referral is null, but no error (user already logged in)
  const inviter = referral?.inviter || {
    name: 'Someone',
    avatarUrl: '/images/avatars/default.png',
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Branding & Image */}
      <div className="relative flex-1 flex flex-col justify-center items-center bg-surface-light dark:bg-surface-light/10 px-10 py-16 overflow-hidden">
        <img
          src={coverUrl}
          alt="Travel background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none select-none"
          style={{ zIndex: 0 }}
        />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <img src="/logo.svg" alt="withme.travel logo" className="w-20 h-20 mb-2" />
          <h2 className="text-4xl font-extrabold text-primary-text text-center mb-2">
            withme.travel
          </h2>
          <p className="text-xl text-secondary-text text-center max-w-xs mb-4">
            Plan trips with friends—real collaboration, zero chaos.
          </p>
        </div>
      </div>
      {/* Right: Invite Details */}
      <div className="flex-1 flex flex-col justify-center items-center px-10 py-16 bg-primary-bg">
        <div className="w-full max-w-md flex flex-col items-center gap-8">
          {inviter.avatarUrl ? (
            <img
              src={inviter.avatarUrl}
              alt={inviter.name + ' avatar'}
              className="w-20 h-20 rounded-full border-2 border-accent-purple shadow-md mb-2"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-accent-purple bg-accent-purple/20 flex items-center justify-center shadow-md mb-2">
              <span className="text-accent-purple text-2xl font-bold">
                {inviter.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-extrabold text-balance mb-2">
            {inviter.name} invited you to join{' '}
            <span className="text-accent-purple">withme.travel</span>
          </h1>
          <ul className="text-lg text-secondary-text mb-6 space-y-2 list-disc list-inside">
            <li>Real-time group trip planning</li>
            <li>Collaborative itineraries, polls, and budgets</li>
            <li>Authentic local tips and guides</li>
            <li>All your friends, all in one place</li>
          </ul>
          {!currentUser ? (
            <>
              <a
                href={`/signup?referral=${token}`}
                className="inline-block bg-accent-purple text-white font-semibold rounded-full px-8 py-3 text-lg shadow-lg hover:bg-accent-purple/90 transition-colors mb-2"
              >
                Sign up and start planning
              </a>
              <div className="text-sm text-muted">
                Already have an account?{' '}
                <a
                  href={`/login?redirect=/dashboard&referral=${token}`}
                  className="text-accent-blue underline font-medium"
                >
                  Log in
                </a>
              </div>
            </>
          ) : (
            <button
              className="bg-accent-purple text-white font-semibold rounded-full px-8 py-3 text-lg shadow-lg hover:bg-accent-purple/90 transition-colors"
              onClick={handleGoToDashboard}
            >
              Go to dashboard
            </button>
          )}
          <div className="mt-10 bg-surface-light dark:bg-surface-light/10 rounded-2xl p-6 shadow-md w-full">
            <h2 className="text-xl font-bold mb-2">What is withme.travel?</h2>
            <p className="text-base text-secondary-text">
              Plan trips, organize groups, and make travel planning fun again. WithMe is your
              friendly, collaborative space for group adventures—no more endless group chats or lost
              docs. Jump in and start planning together!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
