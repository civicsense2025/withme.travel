import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, CheckCircle, Copy, Lock, Link2, Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type TripPrivacySetting = 'private' | 'shared_with_link' | 'public';

export interface ShareTripButtonProps {
  slug: string | null;
  privacySetting: TripPrivacySetting | null;
  tripId?: string;
  className?: string;
  onPrivacyChange?: (setting: 'private' | 'shared_with_link' | 'public') => Promise<void>;
}

export function ShareTripButton({ 
  slug, 
  privacySetting, 
  tripId,
  className,
  onPrivacyChange
}: ShareTripButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentPrivacy, setCurrentPrivacy] = useState(privacySetting || 'private');
  const [isSaving, setIsSaving] = useState(false);

  const shareUrl = slug ? `${window.location.origin}/trips/public/${slug}` : '';

  const handleCopyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handlePrivacyChange = async (value: string) => {
    if (!onPrivacyChange) return;
    
    const newSetting = value as 'private' | 'shared_with_link' | 'public';
    setIsSaving(true);
    
    try {
      await onPrivacyChange(newSetting);
      setCurrentPrivacy(newSetting);
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get button text based on privacy setting
  const getShareButtonLabel = () => {
    switch (currentPrivacy) {
      case 'public': return 'Public';
      case 'shared_with_link': return 'Link-Only';
      case 'private': return 'Private';
      default: return 'Share Trip';
    }
  };

  // Get button icon based on privacy setting
  const getShareButtonIcon = () => {
    switch (currentPrivacy) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'shared_with_link': return <Link2 className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      default: return <Share2 className="h-4 w-4" />;
    }
  };

  // Helper to get privacy label and icon
  const getPrivacyInfo = () => {
    switch (currentPrivacy) {
      case 'public':
        return { label: 'Anyone with the link', icon: <Globe className="h-4 w-4" /> };
      case 'shared_with_link':
        return { label: 'Anyone with the link', icon: <Link2 className="h-4 w-4" /> };
      case 'private':
      default:
        return { label: 'Only trip members', icon: <Lock className="h-4 w-4" /> };
    }
  };
  
  const { label, icon } = getPrivacyInfo();
  
  // If trip is private, don't show sharing options
  const isPrivate = currentPrivacy === 'private';
  
  return (
    <TooltipProvider>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-2", className)}>
                {getShareButtonIcon()}
                {getShareButtonLabel()}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share and privacy settings</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="w-80 p-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Trip Privacy</h4>
              <p className="text-xs text-muted-foreground">
                Control who can see your trip
              </p>
            </div>
            
            <RadioGroup 
              value={currentPrivacy} 
              onValueChange={handlePrivacyChange} 
              className="gap-2"
              disabled={isSaving || !onPrivacyChange}
            >
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Private</p>
                    <p className="text-xs text-muted-foreground">Only invited members can view</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="shared_with_link" id="link" />
                <Label htmlFor="link" className="flex items-center gap-2 cursor-pointer">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Link Sharing</p>
                    <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 rounded-md border p-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Public</p>
                    <p className="text-xs text-muted-foreground">Anyone can find and view</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
            {!isPrivate && slug && (
              <>
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Share Link</h4>
                  <p className="text-xs text-muted-foreground">
                    {currentPrivacy === 'public'
                      ? 'Anyone can view this trip with the link below.'
                      : 'Only people with this link can view this trip.'}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Input value={shareUrl} readOnly className="h-9" />
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
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
