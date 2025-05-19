'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
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

export default function TripInvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [coverUrl, setCoverUrl] = useState<string>(getRandomImage());

  const token = params?.token;

  useEffect(() => {
    if (!token) {
      setError('Invitation token is missing.');
      setIsLoading(false);
      return;
    }

    async function checkInvitation() {
      try {
        setIsLoading(true);
        setError(null);

        // Check auth state
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch invitation details
        const response = await fetch(`/api/invitations/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('This invitation link is invalid or has expired');
            return;
          }
          throw new Error(`Failed to verify invitation: ${response.status}`);
        }

        const data = await response.json();
        setInvitation(data.invitation);

        // If there's a trip cover, use it
        if (data.invitation.trip.coverUrl) {
          setCoverUrl(data.invitation.trip.coverUrl);
        }
      } catch (err: any) {
        console.error('Error checking invitation:', err);
        setError(err.message || 'Failed to verify invitation');
      } finally {
        setIsLoading(false);
      }
    }

    checkInvitation();
  }, [token, supabase]);

  const handleAcceptInvitation = async () => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Invitation token missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAccepting(true);

      // Check if user is logged in
      if (!currentUser) {
        // If not logged in, redirect to signup with invitation token
        router.push(`/signup?invitation=${token}`);
        return;
      }

      // User is logged in, accept the invitation
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      const data = await response.json();

      toast({
        title: "You've joined the trip!",
        description: "You've been added to the trip successfully",
      });

      // Redirect to the trip
      router.push(`/trips/${data.tripId}`);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to accept invitation',
        variant: 'destructive',
      });
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-purple mb-4" />
          <p className="text-muted">Verifying invitation...</p>
        </div>
      </main>
    );
  }

  if (error || !invitation) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-xl mx-auto py-16 px-6 text-center">
          <h1 className="text-3xl font-extrabold mb-4">This invite has expired</h1>
          <p className="text-lg text-muted mb-8">
            {error ||
              'This invitation link is invalid or has expired. If you think this is a mistake, ask your friend to send a new one!'}
          </p>
          <a href="/" className="text-accent-purple font-medium underline">
            Back to home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Branding & Image */}
      <div className="relative flex-1 flex flex-col justify-center items-center bg-surface-light dark:bg-surface-light/10 px-10 py-16 overflow-hidden">
        <img
          src={coverUrl}
          alt="Trip background"
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
          <h1 className="text-3xl font-extrabold text-balance mb-2">
            Join <span className="text-accent-purple">{invitation.trip.name}</span> on withme.travel
          </h1>
          <p className="text-lg text-muted mb-4">
            <span className="font-semibold">{invitation.inviter.name}</span> invited you to this
            trip.
          </p>

          {invitation.trip.members && invitation.trip.members.length > 0 && (
            <div className="flex gap-4 mb-6">
              {invitation.trip.members.map((member: any, i: number) => (
                <div key={i} className="flex flex-col items-center">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name + ' avatar'}
                      className="w-12 h-12 rounded-full border-2 border-accent-purple"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-accent-purple bg-accent-purple/20 flex items-center justify-center">
                      <span className="text-accent-purple text-sm font-bold">
                        {member.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-xs mt-1 text-secondary-text">{member.name}</span>
                </div>
              ))}
            </div>
          )}

          {!currentUser ? (
            <>
              <a
                href={`/signup?invitation=${token}`}
                className="inline-block bg-accent-purple text-white font-semibold rounded-full px-8 py-3 text-lg shadow-lg hover:bg-accent-purple/90 transition-colors mb-2"
              >
                Sign up to join this trip
              </a>
              <div className="text-sm text-muted">
                Already have an account?{' '}
                <a
                  href={`/login?redirect=/invite/${token}`}
                  className="text-accent-blue underline font-medium"
                >
                  Log in
                </a>
              </div>
            </>
          ) : (
            <button
              className="bg-accent-purple text-white font-semibold rounded-full px-8 py-3 text-lg shadow-lg hover:bg-accent-purple/90 transition-colors disabled:opacity-70"
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
                  Joining trip...
                </>
              ) : (
                'Join trip'
              )}
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
