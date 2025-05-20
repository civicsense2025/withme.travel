'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MapPin,
  Calendar,
  ClipboardList,
  DollarSign,
  Users,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Home,
} from 'lucide-react';
import Link from 'next/link';

interface TripTourClientProps {
  trip: any;
  groupName: string;
}

export default function TripTourClient({ trip, groupName }: TripTourClientProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Tour steps content
  const tourSteps = [
    {
      title: 'Welcome to Your New Trip!',
      description:
        "You've successfully created a trip based on your group's ideas! Let's take a quick tour to get you familiar with the trip management tools.",
      icon: <CheckCircle className="h-16 w-16 text-green-500" />,
      image: null,
    },
    {
      title: 'Trip Overview',
      description:
        'This is your trip dashboard. Here you can see all the important details at a glance, including dates, destinations, and activities.',
      icon: <MapPin className="h-16 w-16 text-blue-500" />,
      image: '/images/tour/trip-overview.png',
    },
    {
      title: 'Trip Itinerary',
      description:
        'The itinerary section lets you plan your trip day by day. Add activities, accommodations, and transportation all in one place.',
      icon: <Calendar className="h-16 w-16 text-purple-500" />,
      image: '/images/tour/trip-itinerary.png',
    },
    {
      title: 'Trip Budget',
      description:
        'Track your expenses and budget in the budget section. Add costs for accommodations, activities, and transportation.',
      icon: <DollarSign className="h-16 w-16 text-green-500" />,
      image: '/images/tour/trip-budget.png',
    },
    {
      title: 'Collaborate with Friends',
      description:
        'Your trip is fully collaborative! Invite friends to join your trip and plan together in real-time.',
      icon: <Users className="h-16 w-16 text-amber-500" />,
      image: '/images/tour/trip-collaborate.png',
    },
    {
      title: "You're All Set!",
      description: "You're ready to start planning your trip. Jump in and have fun!",
      icon: <CheckCircle className="h-16 w-16 text-green-500" />,
      image: null,
    },
  ];

  const currentTourStep = tourSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour complete, go to trip page
      router.push(`/trips/${trip.id}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip the tour and go to trip page
    router.push(`/trips/${trip.id}`);
  };

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center">
      {/* Top navigation */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="font-semibold">WithMe.travel</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleSkip}>
            Skip Tour
          </Button>
        </div>
      </div>
      {/* Progress indicator */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex items-center justify-between">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 ${
                index < currentStep
                  ? 'bg-primary'
                  : index === currentStep
                    ? 'bg-primary/70'
                    : 'bg-gray-200'
              } ${index > 0 ? 'ml-1' : ''}`}
            />
          ))}
        </div>
      </div>
      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-4xl"
        >
          <Card className="border shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{currentTourStep.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center py-8">
              <div className="mb-6">{currentTourStep.icon}</div>

              {currentTourStep.image && (
                <div className="w-full max-w-2xl mb-6 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={currentTourStep.image}
                    alt={currentTourStep.title}
                    className="w-full h-auto"
                  />
                </div>
              )}

              <p className="text-center text-lg max-w-2xl">{currentTourStep.description}</p>
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {tourSteps.length}
              </div>

              <Button onClick={handleNext}>
                {currentStep < tourSteps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Start Planning
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {currentStep === 0 && (
            <div className="mt-8 text-center">
              <h3 className="text-lg font-medium mb-2">Trip Details</h3>
              <p className="text-muted-foreground">
                <strong>Trip Name:</strong> {trip.name} <br />
                <strong>Group:</strong> {groupName} <br />
                <strong>Created:</strong> {new Date(trip.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
