'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/lib/hooks/use-toast';

interface RequestAccessDialogProps {
  tripId: string;
}

export function RequestAccessDialog({ tripId }: RequestAccessDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/trips/${tripId}/request-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit request');
      }

      setHasRequested(true);
      toast({
        title: 'Request submitted',
        description: 'Trip organizers have been notified of your request',
      });

      // Close dialog after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setMessage('');
      }, 2000);
    } catch (error: any) {
      console.error('Error requesting access:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button variant="outline" className="gap-1">
          <Lock className="h-4 w-4" />
          Request Edit Access
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Edit Access</DialogTitle>
          <DialogDescription>
            Send a request to the trip organizers for permission to edit this trip.
          </DialogDescription>
        </DialogHeader>

        {hasRequested ? (
          <div className="py-4 text-center">
            <div className="text-green-500 mb-2">✓</div>
            <p className="font-medium">Request Submitted</p>
            <p className="text-sm text-muted-foreground">
              The trip organizers have been notified and will review your request.
            </p>
          </div>
        ) : (
          <>
            <div className="py-4">
              <label htmlFor="message" className="text-sm font-medium block mb-2">
                Message (optional)
              </label>
              <Textarea
                id="message"
                placeholder="Let the organizers know why you'd like edit access..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
