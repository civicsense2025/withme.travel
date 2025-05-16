'use client';

import React, { useState, useEffect } from 'react';
import { useReferral } from '@/hooks/use-referral';
import { Clipboard, RefreshCw } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ReferralLinkManagerProps {
  className?: string;
}

export const ReferralLinkManager: React.FC<ReferralLinkManagerProps> = ({ className }) => {
  const {
    isLoading,
    error,
    referralLink,
    getFormattedExpirationDate,
    getReferralLink,
    generateReferralLink,
    copyReferralLink,
  } = useReferral({ autoFetch: true });

  // Show or hide the copied notification
  const [showCopied, setShowCopied] = useState(false);

  // Handle copy button click
  const handleCopyClick = async () => {
    const success = await copyReferralLink();
    if (success) {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 3000);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Your Referral Link</CardTitle>
        <CardDescription>
          Invite friends to join withme.travel. You&apos;ll both get special perks!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              readOnly
              value={isLoading ? 'Loading...' : referralLink || 'No referral link available'}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyClick}
              disabled={isLoading || !referralLink}
              title="Copy to clipboard"
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>

          {showCopied && (
            <p className="text-xs text-green-600 dark:text-green-400">Copied to clipboard!</p>
          )}

          {getFormattedExpirationDate() && (
            <p className="text-xs text-muted-foreground">
              Expires on: {getFormattedExpirationDate()}
            </p>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          <h4 className="font-medium text-foreground">How it works:</h4>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Share your personal link with friends</li>
            <li>When they sign up, you&apos;ll both get rewards</li>
            <li>Track your referrals in your account dashboard</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={generateReferralLink}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New Link
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
