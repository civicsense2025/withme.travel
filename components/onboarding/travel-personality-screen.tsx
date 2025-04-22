"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TravelPersonalityScreenProps {
  userData: {
    travelPersonality: string
  }
  onInputChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

export function TravelPersonalityScreen({ userData, onInputChange, onNext, onBack }: TravelPersonalityScreenProps) {
  const personalities = [
    { id: "planner", emoji: "🗓️", label: "the planner" },
    { id: "adventurer", emoji: "🌈", label: "the adventurer" },
    { id: "foodie", emoji: "🍽️", label: "the foodie" },
    { id: "sightseer", emoji: "📸", label: "the sightseer" },
    { id: "relaxer", emoji: "🛋️", label: "the relaxer" },
    { id: "culture", emoji: "🎭", label: "the culture buff" },
  ]

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6">
        <div className="text-center mb-6">
          <div className="mb-4 text-4xl">🧳</div>
          <h1 className="text-2xl font-bold mb-2 lowercase">what kind of traveler are you?</h1>
          <p className="text-muted-foreground mb-4 lowercase">tap the emoji that feels most like you</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {personalities.map((personality) => (
            <Button
              key={personality.id}
              variant={userData.travelPersonality === personality.id ? "default" : "outline"}
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => onInputChange("travelPersonality", personality.id)}
            >
              <span className="text-2xl">{personality.emoji}</span>
              <span>{personality.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 lowercase">
            back
          </Button>
          <Button onClick={onNext} className="flex-1 lowercase" disabled={!userData.travelPersonality}>
            continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
