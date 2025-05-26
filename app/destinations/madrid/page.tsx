"use client"

import { DestinationOverview } from "../../../components/destination-overview"

const madridDestination = {
  id: "madrid",
  name: "Madrid",
  country: "Spain",
  emoji: "🇪🇸",
  imageUrl: "/placeholder.svg?height=400&width=1200",
  description:
    "Madrid, Spain's central capital, is a city of elegant boulevards and expansive, manicured parks such as the Buen Retiro. It's renowned for its rich repositories of European art, including the Prado Museum's works by Goya, Velázquez and other Spanish masters. The heart of old Hapsburg Madrid is the portico-lined Plaza Mayor, and nearby is the baroque Royal Palace and Armory, displaying historic weaponry.",
}

export default function MadridPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-2xl font-bold text-gray-900">
              withme.
            </a>
            <nav className="flex space-x-6">
              <a href="/dashboard" className="text-gray-400 hover:text-gray-600 font-medium">
                Planner
              </a>
              <a href="/destinations" className="text-black font-medium relative">
                Destinations
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
              </a>
              <a href="/experiences" className="text-gray-400 hover:text-gray-600 font-medium">
                Experiences
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <button className="h-8 w-8 p-0 flex items-center justify-center">⭐</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">+ New Trip</button>
          </div>
        </div>
      </header>

      <DestinationOverview destination={madridDestination} />
    </div>
  )
}
