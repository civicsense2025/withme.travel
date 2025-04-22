"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TravelSquadScreenProps {
  userData: {
    travelSquad: string
  }
  onInputChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

export function TravelSquadScreen({ userData, onInputChange, onNext, onBack }: TravelSquadScreenProps) {
  const squads = [
    { id: "friends", label: "friends" },
    { id: "family", label: "family" },
    { id: "partner", label: "partner" },
    { id: "solo", label: "solo (but open to group trips!)" },
    { id: "coworkers", label: "coworkers" },
    { id: "mixed", label: "mixed crew - depends on the trip!" },
  ]

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6">
        <div className="text-center mb-6">
          <div className="mb-4 text-4xl">👯‍♀️</div>
          <h1 className="text-2xl font-bold mb-2">who do you usually travel with?</h1>
        </div>

        <div className="space-y-3 mb-6">
          {squads.map((squad) => (
            <Button
              key={squad.id}
              variant={userData.travelSquad === squad.id ? "default" : "outline"}
              className="w-full justify-start text-left py-3"
              onClick={() => onInputChange("travelSquad", squad.id)}
            >
              {squad.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            back
          </Button>
          <Button onClick={onNext} className="flex-1" disabled={!userData.travelSquad}>
            continue
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
