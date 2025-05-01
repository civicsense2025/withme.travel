'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from '@/components/login-form';
import { MapPin, Heart, Users, ClipboardList } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useEffect, useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [randomImageUrl, setRandomImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRandomImage() {
      // Fetch only when the modal is open and we don't have an image yet
      if (isOpen && !randomImageUrl) {
        try {
          const response = await fetch('/api/images/random-destination');
          if (response.ok) {
            const data = await response.json();
            if (data.imageUrl) {
              setRandomImageUrl(data.imageUrl);
            }
          }
        } catch (error) {
          console.error('Error fetching random destination image:', error);
          // Optionally set a default fallback image URL here
        }
      }
    }

    fetchRandomImage();
    // Dependency array includes isOpen to refetch if modal is reopened (optional)
    // Add randomImageUrl to prevent refetching if already loaded
  }, [isOpen, randomImageUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Sign in to withme.travel</DialogTitle>
        </VisuallyHidden>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Benefits Section - Updated with background image */}
          <div
            className="bg-gradient-to-br from-teal-500/20 via-primary/20 to-purple-500/20 dark:from-teal-500/10 dark:via-primary/10 dark:to-purple-500/10 p-8 flex flex-col justify-center relative bg-cover bg-center"
            style={randomImageUrl ? { backgroundImage: `url(${randomImageUrl})` } : {}} // Apply background image dynamically
          >
            {/* Darker overlay for better text readability and blending */}
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]" />
            {/* Added mix-blend-mode to blend with gradient (optional, adjust as needed) */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-primary/20 to-purple-500/20 dark:from-teal-500/10 dark:via-primary/10 dark:to-purple-500/10 opacity-80 mix-blend-multiply" /> */}
            <div className="relative z-10">
              {' '}
              {/* Ensure content is above overlays */}
              <h2 className="text-2xl font-bold mb-4 text-white dark:text-white">
                {' '}
                {/* Ensure text is visible */}
                tired of messy group travel?
              </h2>
              <p className="text-gray-200 dark:text-gray-300 mb-8">
                {' '}
                {/* Adjust text color */}
                we get it – coordinating trips with friends can be chaotic. let's fix that together.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <ClipboardList className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">no more spreadsheet chaos</h3>
                    <p className="text-sm text-muted-foreground">
                      finally, a place to organize everything without endless excel tabs and google
                      docs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />{' '}
                  {/* Added flex-shrink-0 */}
                  <div>
                    <h3 className="font-medium mb-1 text-white dark:text-white">
                      everyone's actually involved
                    </h3>
                    <p className="text-sm text-gray-200 dark:text-gray-300">
                      share ideas, vote on plans, and keep the whole crew in sync (no more group
                      chat chaos)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="h-6 w-6 text-primary mt-1 flex-shrink-0" />{' '}
                  {/* Added flex-shrink-0 */}
                  <div>
                    <h3 className="font-medium mb-1 text-white dark:text-white">
                      save ideas for later
                    </h3>
                    <p className="text-sm text-gray-200 dark:text-gray-300">
                      spot something cool? bookmark it for your next trip instead of losing it
                      forever
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0" />{' '}
                  {/* Added flex-shrink-0 */}
                  <div>
                    <h3 className="font-medium mb-1 text-white dark:text-white">
                      actually helpful local tips
                    </h3>
                    <p className="text-sm text-gray-200 dark:text-gray-300">
                      skip the tourist traps with insider recommendations that your group will love
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form Section */}
          <div className="p-8 flex items-center justify-center min-h-[600px]">
            <div className="w-full max-w-sm">
              <LoginForm />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
