'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreatePollForm } from '@/components/trips/molecules';
import { Button } from '@/components/ui/button';
import { Plus, Vote, VoteIcon } from 'lucide-react';

interface CreatePollModalProps {
  tripId: string;
  onPollCreated: () => void;
  children?: React.ReactNode;
}

export function CreatePollModal({ tripId, onPollCreated, children }: CreatePollModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onPollCreated();
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        {children || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <VoteIcon className="h-4 w-4" />
            Create Poll
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Poll</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <CreatePollForm tripId={tripId} onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
