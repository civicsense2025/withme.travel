'use client';

import * as React from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/components/auth-provider';
import { useEffect } from 'react';

interface CreateIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function CreateIdeaDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: CreateIdeaDialogProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [ideaType, setIdeaType] = React.useState('');
  const [link, setLink] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const isGuest = !user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    if (!ideaType) {
      toast({
        title: 'Error',
        description: 'Please select an idea type',
        variant: 'destructive',
      });
      return;
    }

    const formData = {
      title,
      description,
      type: ideaType,
      link: link || null,
      notes: notes || null,
    };

    await onSubmit(formData);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIdeaType('');
    setLink('');
    setNotes('');
  };

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a new idea</DialogTitle>
            <DialogDescription>
              {isGuest
                ? 'Share your idea with the group as a guest. Others can comment and vote on it.'
                : 'Share your idea with the group. Everyone can comment and vote on it.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="My awesome idea"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={ideaType} onValueChange={setIdeaType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue>{ideaType || 'Select idea type'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Idea Types</SelectLabel>
                    <SelectItem value="place">Place to visit</SelectItem>
                    <SelectItem value="activity">Activity</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="food">Food & Drink</SelectItem>
                    <SelectItem value="transport">Transportation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Tell us more about your idea"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                Link
              </Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="col-span-3"
                placeholder="Add a link (optional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder="Any additional notes (optional)"
              />
            </div>
            {isGuest && (
              <div className="col-span-full pt-2 px-2 text-sm text-muted-foreground">
                <p>
                  You're adding this idea as a guest.{' '}
                  <a href="/signup" className="text-primary underline">
                    Sign up
                  </a>{' '}
                  to create an account and manage all your ideas.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create idea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
