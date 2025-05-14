'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';

interface DashboardProfileProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  };
  profile?: {
    id: string;
    name?: string;
    avatar_url?: string;
    bio?: string;
  } | null;
}

export function DashboardProfile({ user, profile }: DashboardProfileProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Get display name from profile or user metadata
  const displayName =
    profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  // Get avatar URL from profile or user metadata
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || '';

  // Get first letter of email for avatar fallback
  const fallbackInitial = (user?.email || displayName || '?')[0].toUpperCase();

  return (
    <Card className="mb-8">
      <CardHeader className="pb-4">
        <CardTitle className="lowercase text-xl font-semibold">Welcome back</CardTitle>
        <CardDescription>Here's your travel dashboard</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{fallbackInitial}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-bold">{displayName}</h3>
          <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
          <Button
            variant="outline"
            className="w-full rounded-full mt-2"
            onClick={() => {
              setIsLoading(true);
              router.push('/settings');
            }}
            disabled={isLoading}
          >
            <UserCircle className="mr-2 h-4 w-4" />
            {isLoading ? 'Loading...' : 'View profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
