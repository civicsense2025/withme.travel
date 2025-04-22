"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6 text-center">
        <div className="mb-6 text-4xl">✨</div>
        <h1 className="text-2xl font-bold mb-2 lowercase">welcome to withme.travel!</h1>
        <p className="text-muted-foreground mb-8">
          the easy way to plan trips with friends
          <br />
          (without losing your mind in group chats 😅)
        </p>
        <div className="flex flex-col gap-3">
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
  )
}
