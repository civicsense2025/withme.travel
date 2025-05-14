'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { LocationSearch } from '@/components/location-search';
import WelcomeStep from './WelcomeStep';
import PersonalityStep from './PersonalityStep';
import SquadStep from './SquadStep';
import HomeCityStep from './HomeCityStep';
import ConfirmationStep from './ConfirmationStep';
import { Button } from '@/components/ui/button';

const TOTAL_STEPS = 5;

// Suggested interest strengths based on personality type
const PERSONALITY_SUGGESTED_INTERESTS: Record<string, Record<string, number>> = {
  planner: {
    'organized-travel': 90,
    'itinerary-planning': 80,
    'cultural-sites': 70,
    museums: 60,
    'guided-tours': 70,
  },
  adventurer: {
    'outdoor-activities': 90,
    hiking: 80,
    'local-experiences': 70,
    'off-beaten-path': 80,
    'adventure-sports': 70,
  },
  foodie: {
    'local-cuisine': 90,
    'food-tours': 80,
    'cooking-classes': 70,
    'wine-tasting': 60,
    'street-food': 80,
  },
  sightseer: {
    landmarks: 90,
    photography: 80,
    'scenic-views': 90,
    'city-walks': 70,
    architecture: 70,
  },
  relaxer: {
    beaches: 90,
    'spa-wellness': 80,
    'luxury-hotels': 70,
    'peaceful-locations': 80,
    nature: 60,
  },
  culture: {
    'local-culture': 90,
    history: 80,
    'art-galleries': 70,
    'traditional-events': 80,
    'language-learning': 60,
  },
};

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    travelPersonality: '',
    travelSquad: '',
    homeLocationId: '' as string | null,
    onboardingCompleted: false,
    onboardingCompletedAt: '',
    onboardingStep: 1,
  });
  const [loading, setLoading] = useState(true);

  // Fetch onboarding state from API
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setOnboardingData({
        travelPersonality: data.travelPersonality || '',
        travelSquad: data.travelSquad || '',
        homeLocationId: data.homeLocationId || null,
        onboardingCompleted: data.onboardingCompleted || false,
        onboardingCompletedAt: data.onboardingCompletedAt || '',
        onboardingStep: data.onboardingStep || 1,
      });
      setStep(data.onboardingStep || 1);
      setLoading(false);
      if (data.onboardingCompleted) {
        router.replace('/dashboard');
      }
    }
    fetchProfile();
  }, [router]);

  // Save progress after each step
  const saveStep = async (fields: Partial<typeof onboardingData>) => {
    const updated = { ...onboardingData, ...fields, onboardingStep: step };
    setOnboardingData(updated);
    await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  // Complete onboarding and track research event if in research mode
  const completeOnboarding = async () => {
    console.log('[Onboarding] Completing onboarding flow');

    const completionTimestamp = new Date().toISOString();

    await saveStep({
      onboardingCompleted: true,
      onboardingCompletedAt: completionTimestamp,
    });

    router.replace('/dashboard');
  };

  // Step components (now modular)
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <WelcomeStep
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
            saveStep={saveStep}
            setStep={setStep}
          />
        );
      case 2:
        return (
          <PersonalityStep
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
            saveStep={saveStep}
            setStep={setStep}
          />
        );
      case 3:
        return (
          <SquadStep
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
            saveStep={saveStep}
            setStep={setStep}
          />
        );
      case 4:
        return (
          <HomeCityStep
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
            saveStep={saveStep}
            setStep={setStep}
          />
        );
      case 5:
        return (
          <ConfirmationStep
            onboardingData={onboardingData}
            setOnboardingData={setOnboardingData}
            saveStep={saveStep}
            setStep={setStep}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/30 mb-4"></div>
          <div className="h-4 w-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="flex items-center justify-center mb-12">
          <div className="text-center">
            <h1 className="text-gradient text-4xl md:text-5xl font-bold mb-1">
              withme<span className="text-primary">.travel</span>
            </h1>
            <p className="text-muted-foreground">Your group travel adventure begins here</p>
          </div>
        </div>

        <Card className="w-full shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
          <div className="p-1">
            <Progress value={(step / TOTAL_STEPS) * 100} className="h-1.5" />
          </div>
          <CardContent className="p-6 md:p-8">
            {renderStep()}

            <div className="flex justify-between mt-8 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="hover-scale"
              >
                Back
              </Button>

              <Button
                variant="default"
                onClick={async () => {
                  if (step < TOTAL_STEPS) {
                    await saveStep({ onboardingStep: step + 1 });
                    setStep((s) => s + 1);
                  } else {
                    await completeOnboarding();
                  }
                }}
                className="hover-scale"
                data-research-event={step === TOTAL_STEPS ? 'COMPLETE_ONBOARDING' : undefined}
              >
                {step < TOTAL_STEPS ? 'Continue' : 'Get Started'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Personalizing your experience with withme.travel</p>
        </div>
      </div>
    </div>
  );
}
