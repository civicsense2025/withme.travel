'use client';

import { useState, useEffect } from 'react';
import { Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast'; // Assuming you have a toast component

export function ItineraryShareButton() {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Get the current URL only on the client-side
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleCopy = async () => {
    if (!currentUrl) return; // Don't copy if URL isn't set yet

    try {
      await navigator.clipboard.writeText(currentUrl);
      setIsCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'Itinerary URL copied to clipboard.',
      });
      setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
    } catch (err) {
      console.error('Failed to copy URL: ', err);
      toast({
        title: 'Error',
        description: 'Could not copy URL to clipboard.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleCopy}
      disabled={isCopied || !currentUrl}
    >
      {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Share2 className="mr-2 h-4 w-4" />}
      {isCopied ? 'Copied!' : 'Share this Itinerary'}
    </Button>
  );
}
