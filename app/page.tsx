"use client"
import { TrendingDestinations } from "@/components/trending-destinations"
import { HeroSection } from "@/components/hero-section"
import { useAuth } from "@/lib/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  MapPin, 
  CalendarCheck
} from "lucide-react"

export default function Home() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  if (authLoading || user) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      
      {/* Trending Destinations */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 lowercase">trending destinations</h2>
              <p className="text-muted-foreground">discover popular places loved by our community</p>
            </div>
            <Button variant="outline" className="lowercase rounded-full" asChild>
              <Link href="/destinations">view all destinations</Link>
            </Button>
          </div>
          <div>
            <TrendingDestinations />
          </div>
        </div>
      </section>

      {/* Features Section - Increased padding and changed layout */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl md:leading-loose font-extrabold mb-4">
            plan together, <span className="text-travel-purple dark:text-travel-purple">travel better</span>
          </h2>
          <p className="text-lg mb-20 max-w-2xl mx-auto">
            Everything you need to create amazing group trips without the headaches.
          </p>

          {/* Increased spacing between rows */}
          <div className="space-y-16 md:space-y-20">
            {/* Row 1: Two items */}
            <div className="flex flex-col md:flex-row justify-center gap-10 md:gap-16">
              <div className="md:w-1/3 bg-card p-8 rounded-lg shadow-sm border">
                {/* Feature 1: Find cool spots */}
                <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="text-travel-purple dark:text-travel-purple h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">find cool spots</h3>
                <p className="text-muted-foreground">
                  Discover and save places everyone will love. No more endless debates about where to go.
                </p>
              </div>
              <div className="md:w-1/3 bg-card p-8 rounded-lg shadow-sm border">
                {/* Feature 2: Vote on plans */}
                <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-travel-purple dark:text-travel-purple"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
                <h3 className="text-xl font-semibold mb-3">vote on plans</h3>
                <p className="text-muted-foreground">
                  Everyone gets a say. Easily vote on activities, restaurants, and accommodations.
                </p>
              </div>
            </div>

            {/* Row 2: One centered item */}
            <div className="flex justify-center">
              <div className="md:w-1/3 bg-card p-8 rounded-lg shadow-sm border">
                {/* Feature 3: Build your itinerary */}
                <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarCheck className="text-travel-purple dark:text-travel-purple h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-3">build your itinerary</h3>
                <p className="text-muted-foreground">
                  Create the perfect schedule together. Sync with your calendar so you never miss a thing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Increased padding */}
      <section className="py-24 bg-travel-purple/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl md:leading-loose font-extrabold mb-4">
            ready to start planning?
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto">
            Join withme.travel today and make your next group trip the best one yet.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/signup">
              <Button size="lg" className="rounded-full bg-travel-purple hover:bg-purple-400 text-purple-900">
                Sign up - it's free
              </Button>
            </Link>
            <Link href="/destinations">
              <Button size="lg" variant="outline" className="rounded-full">
                Explore destinations
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
