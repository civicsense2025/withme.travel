'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface FeedbackFormProps {
  onSubmit?: (data: { rating: number; feedback: string }) => void;
  initialRating?: number;
  maxRating?: number;
}

export function FeedbackForm({ onSubmit, initialRating = 0, maxRating = 5 }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(initialRating);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      onSubmit?.({ rating, feedback });
      setFeedback('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>How was your experience with withme.travel?</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="text-sm font-medium">Rating</div>
            <div className="flex space-x-1">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  type="button"
                  className="text-2xl focus:outline-none"
                  onClick={() => setRating(star)}
                >
                  <span className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback" className="text-sm font-medium">
              Your Feedback
            </label>
            <Textarea
              id="feedback"
              placeholder="Tell us about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isSubmitting || !rating}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
