'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';

// TODO: Import your design system components (Button, Avatar, Card, etc.)
// TODO: Import your auth and API utilities

export default function GroupInvitePage({ params }: { params: { token: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const token = params?.token;

  // Fetch user auth state and check invitation validity
  useEffect(() => {
    async function fetchUserAndInvitation() {
      if (!token) {
        setError('Invitation token is missing.');
        setIsLoading(false);
        return;
      }

      try {
        // Check auth state
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch invitation details
        const response = await fetch(`/api/invitations/group/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('This invitation link is invalid or has expired');
            return;
          }
          throw new Error(`Failed to verify invitation: ${response.status}`);
        }

        const data = await response.json();
        setInvitation(data.invitation);
      } catch (err: any) {
        console.error('Error checking invitation:', err);
        setError(err.message || 'Failed to verify invitation');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserAndInvitation();
  }, [token, supabase]);

  const handleJoinGroup = async () => {
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

      // Check if user is logged in - redirect to signup if not
      if (!currentUser) {
        router.push(`/signup?group_invitation=${token}`);
        return;
      }

      // User is logged in, accept the invitation
      const response = await fetch(`/api/invitations/group/${token}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
      }

      const data = await response.json();

      toast({
        title: "You've joined the group!",
        description: `You are now a member of ${invitation.group.name}`,
      });

      // Redirect to the group
      router.push(`/groups/${data.groupId}`);
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

  // Loading state
  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-purple mb-4" />
          <p className="text-muted">Verifying invitation...</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error || !invitation) {
    return (
      <main className="max-w-xl mx-auto py-16 px-6 text-center">
        <h1 className="text-3xl font-extrabold mb-4">This invite has expired</h1>
        <p className="text-lg text-muted mb-8">
          {error ||
            'This group invitation link is invalid or has expired. If you think this is a mistake, ask your friend to send a new one!'}
        </p>
        <a href="/" className="text-accent-purple font-medium underline">
          Back to home
        </a>
      </main>
    );
  }

  // Success state - show invitation
  return (
    <main className="max-w-2xl mx-auto py-16 px-6">
      <div className="flex flex-col items-center gap-8">
        {invitation.group.avatarUrl ? (
          <img
            src={invitation.group.avatarUrl}
            alt={invitation.group.name + ' group avatar'}
            className="w-24 h-24 rounded-full shadow-md mb-2"
          />
        ) : (
          <div className="w-24 h-24 rounded-full shadow-md mb-2 bg-accent-purple/20 flex items-center justify-center">
            <span className="text-accent-purple text-2xl font-bold">
              {invitation.group.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <h1 className="text-3xl font-extrabold text-balance mb-2">
          Join <span className="text-accent-purple">{invitation.group.name}</span> on withme.travel
        </h1>
        <p className="text-lg text-muted mb-4">
          <span className="font-semibold">{invitation.inviter.name}</span> invited you to join this
          group.
        </p>
        <div className="flex gap-4 mb-6">
          {invitation.group.members.map((member: any, i: number) => (
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
        {!currentUser ? (
          <>
            <a
              href={`/signup?group_invitation=${token}`}
              className="inline-block bg-accent-purple text-white font-semibold rounded-full px-8 py-3 text-lg shadow-lg hover:bg-accent-purple/90 transition-colors mb-2"
            >
              Sign up to join this group
            </a>
            <div className="text-sm text-muted">
              Already have an account?{' '}
              <a
                href={`/login?redirect=/invite/group/${token}`}
                className="text-accent-blue underline font-medium"
              >
                Log in
              </a>
            </div>
          </>
        ) : (
          <button
            className="bg-accent-purple text-white font-semibold rounded-full px-8 py-3 text-lg shadow-lg hover:bg-accent-purple/90 transition-colors disabled:opacity-70"
            onClick={handleJoinGroup}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 inline animate-spin" />
                Joining group...
              </>
            ) : (
              'Join group'
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
    </main>
  );
}
