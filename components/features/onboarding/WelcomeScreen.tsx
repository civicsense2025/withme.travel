'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold text-center mb-4">Welcome to WithMe Travel</h2>
        <p className="text-center mb-6">Plan and organize your trips with friends and family</p>
        <div className="space-y-3">
          <Button onClick={onNext} size="lg" className="w-full lowercase">
            sign up
          </Button>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full lowercase">
              log in
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
