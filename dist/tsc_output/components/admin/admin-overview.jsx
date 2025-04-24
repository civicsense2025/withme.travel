"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/client";
import { Users, MapPin, Plane, Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
export function AdminOverview() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTrips: 0,
        totalDestinations: 0,
        activeTrips: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const supabase = createClient();
    useEffect(() => {
        fetchStats();
    }, []);
    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use a single API call to get all stats instead of multiple direct Supabase queries
            const response = await fetch('/api/admin/stats');
            if (!response.ok) {
                throw new Error(`Failed to fetch stats: ${response.status}`);
            }
            const data = await response.json();
            setStats(data.stats);
        }
        catch (error) {
            console.error("Error fetching stats:", error);
            setError("Failed to load dashboard statistics. Please try again later.");
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="space-y-4">
      {error && (<Alert variant="destructive">
          <AlertCircle className="h-4 w-4"/>
          <AlertDescription>{error}</AlertDescription>
        </Alert>)}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalTrips}</div>
            <p className="text-xs text-muted-foreground">Created trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.activeTrips}</div>
            <p className="text-xs text-muted-foreground">Currently active trips</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.totalDestinations}</div>
            <p className="text-xs text-muted-foreground">Available destinations</p>
          </CardContent>
        </Card>
      </div>
    </div>);
}
