import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ItineraryNotFound() {
  return (
    <div className="container py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">Itinerary Not Found</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
        We couldn't find the itinerary template you're looking for. It may have been removed or the URL might be
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
