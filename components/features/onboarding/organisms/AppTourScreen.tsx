'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const tourContent = [
  {
    title: 'Plan together',
    description: 'Create trips and invite friends and family to plan together',
    image: '/images/onboarding/plan-together.svg',
  },
  {
    title: 'Discover places',
    description: 'Find interesting places to visit and add them to your itinerary',
    image: '/images/onboarding/discover-places.svg',
  },
  {
    title: 'Stay organized',
    description: 'Keep all your trip details in one place and accessible anytime',
    image: '/images/onboarding/stay-organized.svg',
  },
];

interface AppTourScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

/**
 * App tour screen that introduces key features to new users
 * with a multi-step slideshow
 */
export function AppTourScreen({ onNext, onBack, onSkip }: AppTourScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === tourContent.length - 1;

  const nextStep = () => {
    if (isLastStep) {
      onNext();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep === 0) {
      onBack();
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            {tourContent.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 mx-1 rounded-full ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="mb-6 flex justify-center">
            {tourContent[currentStep].image && (
              <Image
                src={tourContent[currentStep].image}
                alt={tourContent[currentStep].title}
                width={250}
                height={250}
              />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">{tourContent[currentStep].title}</h2>
          <p className="text-muted-foreground">{tourContent[currentStep].description}</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep} className="flex-1 lowercase">
              back
            </Button>
            <Button onClick={nextStep} className="flex-1 lowercase">
              {isLastStep ? 'continue' : 'next'}
            </Button>
          </div>
          <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
            skip tour
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 