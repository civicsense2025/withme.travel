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
  }, [isOpen, randomImageUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Sign in to withme.travel</DialogTitle>
        </VisuallyHidden>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-gradient-to-br from-teal-500/20 via-primary/20 to-purple-500/20 p-8">
            <h2 className="text-2xl font-bold mb-4">tired of messy group travel?</h2>
            <p className="mb-8">
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
                <Users className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">everyone's actually involved</h3>
                  <p className="text-sm text-muted-foreground">
                    share ideas, vote on plans, and keep the whole crew in sync
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 flex items-center justify-center">
            <div className="w-full max-w-sm">
              {/* Temporarily replace the LoginForm component with placeholder text */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Sign In</h3>
                <p>Sign in form would appear here.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
