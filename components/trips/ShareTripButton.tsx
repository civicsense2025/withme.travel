import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, CheckCircle, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface ShareTripButtonProps {
  slug: string | null;
  privacySetting: 'private' | 'shared_with_link' | 'public' | null;
  className?: string;
}

export function ShareTripButton({ slug, privacySetting, className = '' }: ShareTripButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  if (!slug || privacySetting === 'private') {
    return null;
  }

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/trips/public/${slug}`
      : `/trips/public/${slug}`;

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
                <Share2 className="h-4 w-4" />
                Share Trip
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share this trip</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-80 p-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Share Trip</h4>
              <p className="text-sm text-muted-foreground">
                {privacySetting === 'public'
                  ? 'Anyone can view this trip with the link below.'
                  : 'Only people with this link can view this trip.'}
              </p>
            </div>
            <div className="flex space-x-2">
              <Input value={publicUrl} readOnly className="h-9" />
              <Button size="sm" className="px-3" onClick={handleCopyToClipboard}>
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
