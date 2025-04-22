"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminTrips } from "@/components/admin/admin-trips"
import { AdminUsers } from "@/components/admin/admin-users"
import { AdminDestinations } from "@/components/admin/admin-destinations"
import { AdminOverview } from "@/components/admin/admin-overview"
import { Card } from "@/components/ui/card"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <AdminOverview />

      <Card>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="destinations">Destinations</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-4">Welcome to the Admin Dashboard</h2>
              <p className="text-muted-foreground">
                Use the tabs above to manage trips, users, and destinations for withme.travel.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="trips">
            <AdminTrips />
          </TabsContent>
          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>
          <TabsContent value="destinations">
            <AdminDestinations />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
