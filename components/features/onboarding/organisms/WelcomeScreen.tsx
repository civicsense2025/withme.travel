/**
 * WelcomeScreen Organism
 *
 * Displays a welcome message for onboarding.
 * @module components/features/onboarding/organisms/WelcomeScreen
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

/**
 * WelcomeScreen component props
 */
export interface WelcomeScreenProps {
  /** Optional message to display */
  message?: string;
  /** Additional className for styling */
  className?: string;
  onNext: () => void;
}

/**
 * The first screen users see in the onboarding flow
 * Displays welcome message and options to sign up or log in
 */
export function WelcomeScreen({ message = 'Welcome to WithMe Travel!', className, onNext }: WelcomeScreenProps) {
  return (
    <Card className={`w-full max-w-md mx-auto ${className || ''}`}>
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold text-center mb-4">{message}</h2>
        <p className="text-center mb-6">Plan and organize your trips with friends and family</p>
        <div className="space-y-3">
          <Button onClick={onNext} size="lg" className="w-full lowercase">
            sign up
          </Button>
          <Link href="/login" legacyBehavior>
            <Button variant="outline" size="lg" className="w-full lowercase">
              log in
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default WelcomeScreen; 