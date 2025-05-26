"use client"

import { useState } from "react"
import { ArrowLeft, Share, Settings, Plus, Users, Calendar, DollarSign, CheckCircle2, Circle, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { sampleTrip, tripMembers, tripTasks, tripExpenses } from "../../../data/trip-data"

type TabType = "overview" | "itinerary" | "team" | "tasks" | "budget" | "settings"

export default function TripDetailsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [tasks, setTasks] = useState(tripTasks)

  const trip = sampleTrip
  const daysUntilTrip = Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const budgetUsed = (trip.spent / trip.budget) * 100
  const onlineMembers = tripMembers.filter((m) => m.isOnline).length

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      planning: "bg-blue-100 text-blue-700",
      upcoming: "bg-orange-100 text-orange-700",
      active: "bg-green-100 text-green-700",
      completed: "bg-gray-100 text-gray-700",
    }
    return colors[status as keyof typeof colors] || colors.planning
  }

  const tabs = [
    { id: "overview", label: "Overview", emoji: "📋" },
    { id: "itinerary", label: "Itinerary", emoji: "🗓️" },
    { id: "team", label: "Team", emoji: "👥" },
    { id: "tasks", label: "Tasks", emoji: "✅" },
    { id: "budget", label: "Budget", emoji: "💰" },
    { id: "settings", label: "Settings", emoji: "⚙️" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              withme.
            </Link>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-black font-medium relative">
                Planner
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
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

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Trip Hero */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">{trip.emoji}</div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
                <p className="text-gray-600 mt-1">{trip.destination}</p>
                <Badge className={cn("mt-2", getStatusBadge(trip.status))}>{trip.status}</Badge>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="rounded-xl">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" className="rounded-xl">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white/60 rounded-2xl p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold text-gray-900">{trip.duration} days</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="font-semibold text-gray-900">
                {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <div className="text-sm text-gray-600">Dates</div>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold text-gray-900">{trip.travelers} people</div>
              <div className="text-sm text-gray-600">Travelers</div>
            </div>
            <div className="bg-white/60 rounded-2xl p-4 text-center">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <div className="font-semibold text-gray-900">${trip.budget}</div>
              <div className="text-sm text-gray-600">Budget</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="bg-white rounded-2xl p-2 border border-gray-100">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Details */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Details</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-gray-500 text-sm">Dates</span>
                    <div className="font-medium">
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Duration</span>
                    <div className="font-medium">{trip.duration} days</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Travelers</span>
                    <div className="font-medium">{trip.travelers}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Days until trip</span>
                    <div className="font-medium">{daysUntilTrip}</div>
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                  <Badge variant="outline">{tripMembers.length}</Badge>
                </div>
                <div className="space-y-4">
                  {tripMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.role === "admin" ? "default" : "outline"}>{member.role}</Badge>
                        {member.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trip Highlights */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Trip Highlights
                </h3>
                <p className="text-sm text-gray-600 mb-4">Key activities and experiences</p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl">
                    <span className="text-2xl">🗼</span>
                    <div>
                      <div className="font-medium text-sm">Visit the Eiffel Tower</div>
                      <div className="text-xs text-gray-600">Iconic landmark with stunning city views</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
                    <span className="text-2xl">🍽️</span>
                    <div>
                      <div className="font-medium text-sm">Dinner at Le Jules Verne</div>
                      <div className="text-xs text-gray-600">Fine dining experience with panoramic views</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                    <span className="text-2xl">🎨</span>
                    <div>
                      <div className="font-medium text-sm">Louvre Museum Tour</div>
                      <div className="text-xs text-gray-600">Explore world-famous art collections</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{onlineMembers}</div>
                    <div className="text-xs text-gray-600">Online Now</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{daysUntilTrip}</div>
                    <div className="text-xs text-gray-600">Days Until Trip</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{Math.round(budgetUsed)}%</div>
                    <div className="text-xs text-gray-600">Budget Used</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Tasks Complete</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Sarah added Louvre Museum to itinerary</span>
                    <span className="text-gray-400">2h ago</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Mike completed booking task</span>
                    <span className="text-gray-400">5h ago</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Emma added expense for accommodation</span>
                    <span className="text-gray-400">1d ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trip Tasks</h2>
                <p className="text-gray-600">Organize and track everything for your adventure</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="rounded-xl">
                  📋 Templates
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New List
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* General Tasks */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">📝 General Tasks</h3>
                  <span className="text-sm text-gray-500">
                    {tasks.filter((t) => t.completed).length} of {tasks.length} completed
                  </span>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50">
                      <button onClick={() => toggleTask(task.id)}>
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div
                          className={cn("font-medium", task.completed ? "line-through text-gray-500" : "text-gray-900")}
                        >
                          {task.title}
                        </div>
                        {task.category && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:bg-blue-50 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add task
                </Button>
              </div>

              {/* Packing List */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">🧳 Packing List</h3>
                  <span className="text-sm text-gray-500">0 of 0 completed</span>
                </div>

                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-gray-500 mb-4">No packing items yet</p>
                  <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    Add item
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "budget" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trip Budget</h2>
                <p className="text-gray-600">Track expenses and manage splits for your group</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 text-center">
                <div className="text-sm text-gray-500 mb-2">TOTAL BUDGET</div>
                <div className="text-3xl font-bold text-gray-900">${trip.budget}</div>
                <div className="text-sm text-gray-600">Planned amount</div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 text-center">
                <div className="text-sm text-gray-500 mb-2">TOTAL SPENT</div>
                <div className="text-3xl font-bold text-gray-900">${trip.spent}</div>
                <div className="text-sm text-gray-600">{tripExpenses.length} expenses</div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 text-center">
                <div className="text-sm text-gray-500 mb-2">REMAINING</div>
                <div className="text-3xl font-bold text-green-600">${trip.budget - trip.spent}</div>
                <div className="text-sm text-gray-600">{Math.round(100 - budgetUsed)}% left</div>
              </div>
              <div className="bg-white rounded-3xl p-6 border border-gray-100 text-center">
                <div className="text-sm text-gray-500 mb-2">PER PERSON</div>
                <div className="text-3xl font-bold text-gray-900">${Math.round(trip.spent / trip.travelers)}</div>
                <div className="text-sm text-gray-600">Average cost</div>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Budget Progress</h3>
                <span className="text-sm text-gray-500">{Math.round(budgetUsed)}% used</span>
              </div>
              <Progress value={budgetUsed} className="mb-4" />
              <div className="text-sm text-gray-600">
                ${trip.spent} of ${trip.budget} spent
              </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">💳 Recent Expenses</h3>
              {tripExpenses.length > 0 ? (
                <div className="space-y-4">
                  {tripExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="font-medium">{expense.title}</div>
                        <div className="text-sm text-gray-600">
                          Paid by {tripMembers.find((m) => m.id === expense.paidBy)?.name} • {expense.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${expense.amount}</div>
                        <div className="text-sm text-gray-600">
                          ${expense.amount / expense.splitBetween.length} per person
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💸</div>
                  <p className="text-gray-500">No expenses yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add other tab content as needed */}
        {activeTab === "itinerary" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trip Itinerary</h2>
                <p className="text-gray-600">Day-by-day activities and plans</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🗓️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start planning your days</h3>
                <p className="text-gray-600 mb-6">
                  Add activities, meals, and experiences to create the perfect itinerary
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Activity
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
