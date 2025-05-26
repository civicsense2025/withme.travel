"use client"

import { useState } from "react"
import {
  Plus,
  Star,
  Users,
  Calendar,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  MapPin,
  Thermometer,
  BookOpen,
  Camera,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Trip = {
  id: string
  title: string
  location: string
  emoji: string
  status: "happening-soon" | "upcoming" | "past"
  startDate: string
  endDate: string
  daysAway?: number
  travelers: number
  weather?: string
  temperature?: string
  budget?: number
  spent?: number
}

type Task = {
  id: string
  text: string
  completed: boolean
  tripId?: string
}

type Recommendation = {
  id: string
  type: "guide" | "activity" | "restaurant" | "photo-spot"
  title: string
  location: string
  emoji: string
  description: string
}

export default function TravelDashboard() {
  const [activeTab, setActiveTab] = useState("planner")
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")

  const trips: Trip[] = [
    {
      id: "1",
      title: "Paris Adventure",
      location: "Paris, France",
      emoji: "🗼",
      status: "happening-soon",
      startDate: "Jun 15",
      endDate: "Jun 25",
      daysAway: 3,
      travelers: 4,
      weather: "Sunny",
      temperature: "22°C",
      budget: 2500,
      spent: 150,
    },
    {
      id: "2",
      title: "Tokyo Discovery",
      location: "Tokyo, Japan",
      emoji: "🏯",
      status: "happening-soon",
      daysAway: 12,
      startDate: "Jun 24",
      endDate: "Jul 2",
      travelers: 2,
      weather: "Partly Cloudy",
      temperature: "28°C",
      budget: 3200,
      spent: 0,
    },
    {
      id: "3",
      title: "Bali Retreat",
      location: "Bali, Indonesia",
      emoji: "🏝️",
      status: "upcoming",
      startDate: "Aug 20",
      endDate: "Aug 28",
      daysAway: 65,
      travelers: 3,
      weather: "Tropical",
      temperature: "30°C",
      budget: 1800,
      spent: 0,
    },
    {
      id: "4",
      title: "Swiss Alps",
      location: "Zermatt, Switzerland",
      emoji: "🏔️",
      status: "upcoming",
      startDate: "Sep 5",
      endDate: "Sep 12",
      daysAway: 81,
      travelers: 5,
      weather: "Cool",
      temperature: "15°C",
      budget: 4000,
      spent: 0,
    },
    {
      id: "5",
      title: "Santorini Escape",
      location: "Santorini, Greece",
      emoji: "🏛️",
      status: "past",
      startDate: "May 1",
      endDate: "May 7",
      travelers: 2,
      budget: 2200,
      spent: 2180,
    },
    {
      id: "6",
      title: "Iceland Adventure",
      location: "Reykjavik, Iceland",
      emoji: "🌋",
      status: "past",
      startDate: "Mar 15",
      endDate: "Mar 22",
      travelers: 6,
      budget: 3500,
      spent: 3420,
    },
  ]

  const recommendations: Recommendation[] = [
    {
      id: "1",
      type: "guide",
      title: "Ultimate Paris Food Guide",
      location: "Paris",
      emoji: "🥐",
      description: "Best croissants, cafes, and hidden gems",
    },
    {
      id: "2",
      type: "activity",
      title: "Tokyo Night Photography Tour",
      location: "Tokyo",
      emoji: "📸",
      description: "Capture the neon-lit streets of Shibuya",
    },
    {
      id: "3",
      type: "photo-spot",
      title: "Eiffel Tower Golden Hour",
      location: "Paris",
      emoji: "✨",
      description: "Best spots for that perfect shot",
    },
  ]

  const happeningSoonTrips = trips.filter((trip) => trip.status === "happening-soon")
  const upcomingTrips = trips.filter((trip) => trip.status === "upcoming")
  const pastTrips = trips.filter((trip) => trip.status === "past")

  const addTask = (tripId?: string) => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false, tripId }])
      setNewTask("")
    }
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const getDaysAwayBadge = (daysAway: number) => {
    if (daysAway <= 7) {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">🔥 {daysAway} days away!</Badge>
    } else if (daysAway <= 14) {
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">⚡ {daysAway} days away</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">{daysAway} days away</Badge>
    }
  }

  const TripCard = ({ trip, isHappeningSoon = false }: { trip: Trip; isHappeningSoon?: boolean }) => (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 border transition-all duration-200 hover:shadow-lg",
        isHappeningSoon
          ? "border-2 border-gradient-to-r from-purple-400 to-pink-400 shadow-md bg-gradient-to-br from-white to-purple-50"
          : "border-gray-100 hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{trip.emoji}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{trip.title}</h3>
            <p className="text-sm text-gray-500 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {trip.location}
            </p>
            {trip.daysAway && getDaysAwayBadge(trip.daysAway)}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DollarSign className="w-4 h-4 mr-2" />
              Add Expense
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Camera className="w-4 h-4 mr-2" />
              Add Photo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <BookOpen className="w-4 h-4 mr-2" />
              View Guide
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Cancel Trip</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {trip.weather && (
        <div className="flex items-center space-x-4 mb-4 p-3 bg-blue-50 rounded-xl">
          <Thermometer className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            {trip.weather} • {trip.temperature}
          </span>
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Dates</span>
          </div>
          <span className="font-medium">
            {trip.startDate} - {trip.endDate}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Travelers</span>
          </div>
          <span className="font-medium">{trip.travelers} people</span>
        </div>
        {trip.budget && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Budget</span>
            </div>
            <span className="font-medium">
              ${trip.spent || 0} / ${trip.budget}
            </span>
          </div>
        )}
      </div>

      <Button variant="outline" className="w-full rounded-xl">
        View Trip
      </Button>
    </div>
  )

  const RecommendationCard = ({ rec }: { rec: Recommendation }) => (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{rec.emoji}</span>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{rec.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
          <Badge variant="outline" className="text-xs">
            {rec.type === "guide" && "📖 Guide"}
            {rec.type === "activity" && "🎯 Activity"}
            {rec.type === "photo-spot" && "📸 Photo Spot"}
            {rec.type === "restaurant" && "🍽️ Restaurant"}
          </Badge>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">withme.</h1>
            <nav className="flex space-x-6">
              {["Planner", "Destinations"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={cn(
                    "pb-1 relative font-medium transition-colors duration-200",
                    activeTab === tab.toLowerCase() ? "text-black" : "text-gray-400 hover:text-gray-600",
                  )}
                >
                  {tab}
                  {activeTab === tab.toLowerCase() && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
                  )}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Star className="w-4 h-4" />
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Budget Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">💰 Total Budget</p>
                  <p className="text-3xl font-bold text-gray-900">$3,000</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-700 uppercase tracking-wide">Spent</p>
                  <p className="text-2xl font-bold text-gray-900">$50</p>
                </div>
              </div>

              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "2%" }}></div>
              </div>
              <p className="text-sm text-blue-700">2% used • $2,950 left</p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Breakdown</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Add Expense</DropdownMenuItem>
                      <DropdownMenuItem>Set Budget Alert</DropdownMenuItem>
                      <DropdownMenuItem>Export Report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">• Upcoming Trips</span>
                  <span className="font-medium">$0 / $0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">• Past Trips</span>
                  <span className="font-medium">$50 / $3,000</span>
                </div>
              </div>
            </div>

            {/* Tasks Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">✅ My Tasks</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 rounded-xl">
                      <Plus className="w-4 h-4 mr-1" />
                      New
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Add Personal Task</DropdownMenuItem>
                    <DropdownMenuItem>Add Trip Task</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Import from Template</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  placeholder="Add a task, press Enter to save..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTask()}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button onClick={() => addTask()} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex space-x-6 text-sm text-gray-500 mb-4">
                <span>To Do: {tasks.filter((t) => !t.completed).length}</span>
                <span>Active: 0</span>
                <span>Done: {tasks.filter((t) => t.completed).length}</span>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium text-gray-900">No completed tasks</p>
                  <p className="text-sm text-gray-500">Finished tasks will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <button onClick={() => toggleTask(task.id)}>
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <span
                        className={cn(
                          "flex-1 text-sm",
                          task.completed ? "line-through text-gray-500" : "text-gray-900",
                        )}
                      >
                        {task.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Happening Soon - More Prominent */}
            {happeningSoonTrips.length > 0 && (
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-6 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🚀</span>
                    <h2 className="text-2xl font-bold text-gray-900">Happening Soon</h2>
                    <Badge className="bg-purple-600 text-white">🔥 Exciting!</Badge>
                  </div>
                  <Button variant="ghost" className="text-purple-700 hover:bg-purple-50 rounded-xl">
                    View all
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {happeningSoonTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} isHappeningSoon={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">💡 Recommended for You</h3>
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 rounded-xl text-sm">
                  See more
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} rec={rec} />
                ))}
              </div>
            </div>

            {/* Trip Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">🗓️ Upcoming Trips</h3>
                  <span className="text-sm text-gray-500">{upcomingTrips.length}</span>
                </div>
                <div className="space-y-4">
                  {upcomingTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">📸 Past Trips</h3>
                  <span className="text-sm text-gray-500">{pastTrips.length}</span>
                </div>
                <div className="space-y-4">
                  {pastTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
