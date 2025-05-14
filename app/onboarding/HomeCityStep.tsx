import React, { useState } from 'react';
import { LocationSearch } from '@/components/location-search';
import { Card, CardContent } from '@/components/ui/card';

interface HomeCityStepProps {
  onboardingData: any;
  setOnboardingData: (data: any) => void;
  saveStep: (fields: any) => Promise<void>;
  setStep: (step: number) => void;
}

const HomeCityStep: React.FC<HomeCityStepProps> = ({
  onboardingData,
  setOnboardingData,
  saveStep,
}) => {
  const [place, setPlace] = useState<any>(null);

  const handleSelectLocation = async (selected: any) => {
    if (!selected) return;

    setPlace(selected);
    setOnboardingData({
      ...onboardingData,
      homeLocationId: selected.id,
      homeLocationName: selected.name,
      homeLocationData: selected,
    });

    await saveStep({
      homeLocationId: selected.id,
      homeLocationName: selected.name,
      homeLocationData: selected,
    });
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-2xl font-bold text-center mb-2">Where do you call home?</h2>
      <p className="text-muted-foreground text-center mb-6">
        This helps us suggest destinations and calculate travel times.
      </p>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <LocationSearch
            placeholder="Enter your home city"
            onLocationSelect={handleSelectLocation}
            className="w-full"
          />
        </CardContent>
      </Card>

      {place && (
        <div className="mt-6 animate-fade-in-up">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="text-3xl">📍</div>
              <div className="flex-1">
                <h3 className="font-medium">{place.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {place.full_address || place.description}
                </p>
              </div>
            </div>
          </Card>
          <div className="mt-4 text-center text-sm text-primary">
            Great! We'll remember this as your home base.
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeCityStep;
