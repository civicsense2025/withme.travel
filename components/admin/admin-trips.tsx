"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Search, Edit, Trash } from "lucide-react"

interface Trip {
  id: string
  name: string
  destination: string
  start_date: string
  end_date: string
  created_by: string
  created_at: string
  user_email?: string
}

export function AdminTrips() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    setLoading(true)
    try {
      const { data: trips, error } = await supabase
        .from("trips")
        .select(`
          id,
          name,
          destination,
          start_date,
          end_date,
          created_by,
          created_at,
          users(email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Format the trips data
      const formattedTrips = trips.map((trip) => ({
        ...trip,
        user_email: trip.users?.email || "Unknown",
      }))

      setTrips(formattedTrips)
    } catch (error) {
      console.error("Error fetching trips:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredTrips = trips.filter(
    (trip) =>
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.user_email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const confirmDelete = (trip: Trip) => {
    setTripToDelete(trip)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!tripToDelete) return

    setIsDeleting(true)
    try {
      // Delete trip from database
      const { error } = await supabase.from("trips").delete().eq("id", tripToDelete.id)

      if (error) throw error

      // Update UI
      setTrips(trips.filter((trip) => trip.id !== tripToDelete.id))
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting trip:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Trips</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search trips..." className="pl-8" value={searchTerm} onChange={handleSearch} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No trips found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.name}</TableCell>
                    <TableCell>{trip.destination}</TableCell>
                    <TableCell>{trip.user_email}</TableCell>
                    <TableCell>{formatDate(trip.start_date)}</TableCell>
                    <TableCell>{formatDate(trip.end_date)}</TableCell>
                    <TableCell>{new Date(trip.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => router.push(`/trips/${trip.id}`)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(trip)}>
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the trip "{tripToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
