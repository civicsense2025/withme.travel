import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">withme.</h1>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 font-medium">
                Planner
              </Link>
              <Link href="/destinations" className="text-gray-400 hover:text-gray-600 font-medium">
                Destinations
              </Link>
              <Link href="/experiences" className="text-gray-400 hover:text-gray-600 font-medium">
                Experiences
              </Link>
            </nav>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">+ New Trip</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            👋 Wave goodbye to the chaos of endless planning threads
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Your crew has great ideas. Now there's finally a place to organize them all.
          </p>

          {/* Search Bar */}
          <div className="max-w-lg mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🔍 Where are you going?"
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Type a city name to search for destinations</p>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-blue-700 font-medium">Select a destination to start</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-semibold text-gray-900 mb-2">No-frills planning</h3>
            <p className="text-gray-600">Simple, clean interface focused on what matters</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="font-semibold text-gray-900 mb-2">Better with friends</h3>
            <p className="text-gray-600">Collaborate seamlessly with your travel crew</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="font-semibold text-gray-900 mb-2">Easy to use</h3>
            <p className="text-gray-600">Get started in minutes, not hours</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/destinations">
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 py-3 text-lg">Explore Destinations</Button>
          </Link>
          <Link href="/experiences">
            <Button variant="outline" className="rounded-xl px-8 py-3 text-lg">
              Browse Experiences
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
