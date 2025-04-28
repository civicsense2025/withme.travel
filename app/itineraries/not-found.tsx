import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchX } from "lucide-react"

export default function ItineraryNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-5xl leading-loose font-bold mb-4">Itinerary Not Found</h1>
      <p className="text-lg text-muted-foreground mb-6">
        We couldn&apos;t find the itinerary template you&apos;re looking for. It may have been removed or the URL might be
        incorrect.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild>
          <Link href="/itineraries">Browse All Itineraries</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
