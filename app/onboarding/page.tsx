"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { WelcomeScreen } from "@/components/onboarding/welcome-screen"
import { BasicInfoScreen } from "@/components/onboarding/basic-info-screen"
import { TravelPersonalityScreen } from "@/components/onboarding/travel-personality-screen"
import { TravelSquadScreen } from "@/components/onboarding/travel-squad-screen"
import { SuccessScreen } from "@/components/onboarding/success-screen"
import { AppTourScreen } from "@/components/onboarding/app-tour-screen"
import { Card } from "@/components/ui/card"

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [userData, setUserData] = useState({
    firstName: "",
    email: "",
    password: "",
    travelPersonality: "",
    travelSquad: "",
    showTour: true,
    tourStep: 1,
  })
  const router = useRouter()
  const { user, loading } = useAuth()

  // If user is already logged in, redirect to trips page
  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(Math.max(1, step - 1))
  }

  const handleInputChange = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value })
  }

  const handleSkipTour = () => {
    router.push("/trips/new")
  }

  const handleNextTour = () => {
    if (userData.tourStep < 3) {
      setUserData({ ...userData, tourStep: userData.tourStep + 1 })
    } else {
      router.push("/trips/new")
    }
  }

  const handleCreateTrip = () => {
    router.push("/trips/new")
  }

  const handleExplore = () => {
    router.push("/explore")
  }

  // Don't render anything while checking auth
  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-1 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          />
        )}
        {step === 4 && (
          <TravelSquadScreen
            userData={userData}
            onInputChange={handleInputChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 5 && <SuccessScreen onCreateTrip={handleCreateTrip} onExplore={handleExplore} />}
        {step === 6 && <AppTourScreen tourStep={userData.tourStep} onNext={handleNextTour} onSkip={handleSkipTour} />}
      </div>
    </div>
  )
}
