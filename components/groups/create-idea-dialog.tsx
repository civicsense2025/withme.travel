'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateIdeaForm } from './create-idea-form';

interface CreateIdeaDialogProps {
  groupId: string;
  planId: string;
  onIdeaCreated?: (idea: any) => void;
  buttonVariant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  buttonClassName?: string;
  buttonLabel?: string;
  dialogTitle?: string;
  dialogDescription?: string;
}

export function CreateIdeaDialog({
  groupId,
  planId,
  onIdeaCreated,
  buttonVariant = 'default',
  buttonSize,
  buttonClassName = '',
  buttonLabel = 'Add Idea',
  dialogTitle = 'Add a New Idea',
  dialogDescription = 'Share your thoughts, suggestions, or questions with the group.',
}: CreateIdeaDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (data: any) => {
    if (onIdeaCreated) {
      onIdeaCreated(data);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={buttonClassName}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <CreateIdeaForm
          groupId={groupId}
          planId={planId}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
