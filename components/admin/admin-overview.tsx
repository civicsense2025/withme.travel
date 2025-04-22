"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"
import { Users, MapPin, Plane, Calendar } from "lucide-react"

interface Stats {
  totalUsers: number
  totalTrips: number
  totalDestinations: number
  activeTrips: number
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTrips: 0,
    totalDestinations: 0,
    activeTrips: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Get total users
      const { count: userCount, error: userError } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })

      if (userError) throw userError

      // Get total trips
      const { count: tripCount, error: tripError } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })

      if (tripError) throw tripError

      // Get total destinations
      const { count: destCount, error: destError } = await supabase
        .from("destinations")
        .select("*", { count: "exact", head: true })

      if (destError) throw destError

      // Get active trips (trips with end_date in the future)
      const today = new Date().toISOString().split("T")[0]
      const { count: activeCount, error: activeError } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .gte("end_date", today)

      if (activeError) throw activeError

      setStats({
        totalUsers: userCount || 0,
        totalTrips: tripCount || 0,
        totalDestinations: destCount || 0,
        activeTrips: activeCount || 0,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">Registered accounts</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
          <Plane className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalTrips}</div>
          <p className="text-xs text-muted-foreground">Created trips</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.activeTrips}</div>
          <p className="text-xs text-muted-foreground">Currently active trips</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Destinations</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "..." : stats.totalDestinations}</div>
          <p className="text-xs text-muted-foreground">Available destinations</p>
        </CardContent>
      </Card>
    </div>
  )
}
