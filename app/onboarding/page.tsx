'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { WelcomeScreen } from '@/components/onboarding/welcome-screen';
import { BasicInfoScreen } from '@/components/onboarding/basic-info-screen';
import { TravelPersonalityScreen } from '@/components/onboarding/travel-personality-screen';
import { TravelSquadScreen } from '@/components/onboarding/travel-squad-screen';
import { InterestSelector } from '@/components/onboarding/InterestSelector';
import { SuccessScreen } from '@/components/onboarding/success-screen';
import { AppTourScreen } from '@/components/onboarding/app-tour-screen';
import { Progress } from '@/components/ui/progress';

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
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    firstName: '',
    email: '',
    password: '',
    travelPersonality: '',
    travelSquad: '',
    showTour: true,
    tourStep: 1,
    suggestedInterests: {} as Record<string, number>,
  });
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // If user is already logged in, redirect to trips page
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleNext = () => {
    // If moving from personality selection to interests,
    // pre-fill suggested interests based on personality
    if (step === 3 && userData.travelPersonality) {
      const suggestedInterests = PERSONALITY_SUGGESTED_INTERESTS[userData.travelPersonality] || {};
      setUserData((prev) => ({
        ...prev,
        suggestedInterests,
      }));
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    return setStep(Math.max(1, step - 1));
  };

  const handleSkip = () => {
    // Skip to next step for optional screens
    if (step === 3) {
      // Travel Squad
      setStep(4);
    } else if (step === 4) {
      // Interests
      setStep(5);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleSkipTour = () => {
    return router.push('/trips/new');
  };

  const handleNextTour = () => {
    if (userData.tourStep < 3) {
      setUserData({ ...userData, tourStep: userData.tourStep + 1 });
    } else {
      router.push('/trips/new');
    }
  };

  const handleCreateTrip = () => {
    return router.push('/trips/new');
  };

  const handleExplore = () => {
    return router.push('/explore');
  };

  // Don't render anything while checking auth
  if (isLoading) {
    return null;
  }

  const progress = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-gradient-1 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <Progress value={progress} className="w-full" />

        {step === 1 && <WelcomeScreen onNext={handleNext} />}

        {step === 2 && (
          <BasicInfoScreen
            userData={userData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {step === 3 && (
          <TravelPersonalityScreen
            userData={userData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        )}

        {step === 4 && (
          <TravelSquadScreen
            userData={userData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        )}

        {step === 5 && (
          <InterestSelector
            onBack={handleBack}
            onSkip={handleSkip}
            onComplete={handleNext}
            suggestedInterests={userData.suggestedInterests}
          />
        )}

        {step === 6 && <SuccessScreen onCreateTrip={handleCreateTrip} onExplore={handleExplore} />}

        {step === 7 && (
          <AppTourScreen
            tourStep={userData.tourStep}
            onNext={handleNextTour}
            onSkip={handleSkipTour}
          />
        )}
      </div>
    </div>
  );
}
