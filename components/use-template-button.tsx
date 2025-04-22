"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UseTemplateButtonProps {
  destinationId: string | null | undefined
}

export function UseTemplateButton({ destinationId }: UseTemplateButtonProps) {
  const isDisabled = !destinationId
  const href = destinationId ? `/trips/create?destination_id=${destinationId}` : '#'

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDisabled) {
      e.preventDefault()
    }
  }

  return (
    <>
      <Button 
        asChild 
        className="w-full lowercase bg-travel-purple hover:bg-purple-400 text-purple-900 animate-pulse"
        disabled={isDisabled}
        aria-disabled={isDisabled}
      >
        <Link 
          href={href}
          onClick={handleClick} 
        >
          Copy Itinerary
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
      {isDisabled && (
        <p className="text-xs text-muted-foreground mt-2">Cannot use template: destination not linked.</p>
      )}
    </>
  )
} 