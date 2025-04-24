"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TravelPersonalityScreenProps {
  userData: {
    travelPersonality: string
  }
  onInputChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export function TravelPersonalityScreen({ userData, onInputChange, onNext, onBack, onSkip }: TravelPersonalityScreenProps) {
  const personalities = [
    { 
      id: "planner", 
      emoji: "🗓️", 
      label: "the planner", 
      description: "I love organizing every detail",
      tags: ["Organized Travel", "Itinerary Planning", "Cultural Sites"]
    },
    { 
      id: "adventurer", 
      emoji: "🌈", 
      label: "the adventurer", 
      description: "I go where the wind takes me",
      tags: ["Outdoor Activities", "Hiking", "Local Experiences"]
    },
    { 
      id: "foodie", 
      emoji: "🍽️", 
      label: "the foodie", 
      description: "I travel through my taste buds",
      tags: ["Local Cuisine", "Food Tours", "Cooking Classes"]
    },
    { 
      id: "sightseer", 
      emoji: "📸", 
      label: "the sightseer", 
      description: "I want to see it all",
      tags: ["Landmarks", "Photography", "Scenic Views"]
    },
    { 
      id: "relaxer", 
      emoji: "🛋️", 
      label: "the relaxer", 
      description: "Vacation means unwinding",
      tags: ["Beaches", "Spa & Wellness", "Peaceful Locations"]
    },
    { 
      id: "culture", 
      emoji: "🎭", 
      label: "the culture buff", 
      description: "I immerse in local life",
      tags: ["Local Culture", "History", "Art Galleries"]
    },
  ]

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6">
        <div className="text-center mb-6">
          <div className="mb-4 text-4xl">🧳</div>
          <h1 className="text-2xl font-bold mb-2 lowercase">what's your travel style?</h1>
          <p className="text-muted-foreground mb-4 lowercase">
            Pick your style and we'll personalize your experience
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {personalities.map((personality) => (
            <Button
              key={personality.id}
              variant={userData.travelPersonality === personality.id ? "default" : "outline"}
              className="h-auto py-4 flex flex-col gap-2 group transition-all"
              onClick={() => onInputChange("travelPersonality", personality.id)}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{personality.emoji}</span>
              <span className="font-medium">{personality.label}</span>
              <span className="text-xs text-muted-foreground">{personality.description}</span>
              <div className="flex flex-wrap gap-1 justify-center">
                {personality.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-[10px] px-1.5 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1 lowercase">
            back
          </Button>
          <Button onClick={onNext} className="flex-1 lowercase" disabled={!userData.travelPersonality}>
            continue
          </Button>
          </div>
          <Button variant="ghost" onClick={onSkip} className="lowercase text-muted-foreground">
            skip for now
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            This helps us suggest destinations and activities you'll love
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
