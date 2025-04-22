import { TrendingDestinations } from "@/components/trending-destinations"
import { HeroSection } from "@/components/hero-section"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      {/* Hero Section */}
      {/* <section className="bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            plan trips with friends
            <span className="block text-green-500 dark:text-green-400">without the chaos</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            no more endless group chats or spreadsheets. just fun, easy planning that actually works.
          </p>
          <div className="max-w-2xl mx-auto">
            <LocationSearch />
          </div>
        </div>
      </section> */}

      {/* Trending Destinations */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <TrendingDestinations />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">
            plan together, <span className="text-green-500 dark:text-green-400">travel better</span>
          </h2>
          <p className="text-lg mb-12 max-w-2xl mx-auto">
            Everything you need to create amazing group trips without the headaches.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500 dark:text-green-400"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">find cool spots</h3>
              <p className="text-muted-foreground">
                Discover and save places everyone will love. No more endless debates about where to go.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500 dark:text-green-400"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">vote on plans</h3>
              <p className="text-muted-foreground">
                Everyone gets a say. Easily vote on activities, restaurants, and accommodations.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-500 dark:text-green-400"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <path d="m9 16 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">build your itinerary</h3>
              <p className="text-muted-foreground">
                Create the perfect schedule together. Sync with your calendar so you never miss a thing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
