"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/utils/supabase/client"
import { Loader2, Search, Edit, Trash, Plus, ImageIcon } from "lucide-react"
import { Label } from "@/components/ui/label"

interface Destination {
  id: string
  name: string
  country: string
  description: string | null
  image_url: string | null
  created_at: string
}

export function AdminDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [destinationToEdit, setDestinationToEdit] = useState<Destination | null>(null)
  const [destinationToDelete, setDestinationToDelete] = useState<Destination | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    description: "",
    image_url: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    setLoading(true)
    try {
      const { data: destinations, error } = await supabase
        .from("destinations")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error

      setDestinations(destinations || [])
    } catch (error) {
      console.error("Error fetching destinations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredDestinations = destinations.filter(
    (destination) =>
      (destination.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (destination.country?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  )

  const openCreateDialog = () => {
    setFormData({
      name: "",
      country: "",
      description: "",
      image_url: "",
    })
    setCreateDialogOpen(true)
  }

  const openEditDialog = (destination: Destination) => {
    setDestinationToEdit(destination)
    setFormData({
      name: destination.name,
      country: destination.country,
      description: destination.description || "",
      image_url: destination.image_url || "",
    })
    setEditDialogOpen(true)
  }

  const confirmDelete = (destination: Destination) => {
    setDestinationToDelete(destination)
    setDeleteDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateDestination = async () => {
    setIsSaving(true)
    try {
      const { data, error } = await supabase
        .from("destinations")
        .insert([
          {
            name: formData.name,
            country: formData.country,
            description: formData.description || null,
            image_url: formData.image_url || null,
          },
        ])
        .select()

      if (error) throw error

      // Update UI
      if (data && data[0]) {
        setDestinations([...destinations, data[0]])
      }
      setCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating destination:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateDestination = async () => {
    if (!destinationToEdit) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("destinations")
        .update({
          name: formData.name,
          country: formData.country,
          description: formData.description || null,
          image_url: formData.image_url || null,
        })
        .eq("id", destinationToEdit.id)

      if (error) throw error

      // Update UI
      setDestinations(
        destinations.map((dest) =>
          dest.id === destinationToEdit.id
            ? {
                ...dest,
                name: formData.name,
                country: formData.country,
                description: formData.description || null,
                image_url: formData.image_url || null,
              }
            : dest,
        ),
      )
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating destination:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteDestination = async () => {
    if (!destinationToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("destinations").delete().eq("id", destinationToDelete.id)

      if (error) throw error

      // Update UI
      setDestinations(destinations.filter((dest) => dest.id !== destinationToDelete.id))
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting destination:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Destinations</h2>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search destinations..." className="pl-8" value={searchTerm} onChange={handleSearch} />
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Destination
          </Button>
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
                <TableHead>Country</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Image</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDestinations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No destinations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDestinations.map((destination) => (
                  <TableRow key={destination.id}>
                    <TableCell className="font-medium">{destination.name}</TableCell>
                    <TableCell>{destination.country}</TableCell>
                    <TableCell className="max-w-xs truncate">{destination.description || "No description"}</TableCell>
                    <TableCell>
                      {destination.image_url ? (
                        <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                          <img
                            src={destination.image_url || "/placeholder.svg"}
                            alt={destination.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/destinations/paris-eiffel-tower.png";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded flex items-center justify-center bg-muted">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => openEditDialog(destination)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(destination)}>
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

      {/* Create Destination Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Destination</DialogTitle>
            <DialogDescription>Create a new destination for travelers to explore</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="e.g. France"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter a brief description of the destination"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleCreateDestination} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Destination"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Destination Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
            <DialogDescription>Update destination information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country">Country</Label>
              <Input id="edit-country" name="country" value={formData.country} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image_url">Image URL</Label>
              <Input id="edit-image_url" name="image_url" value={formData.image_url} onChange={handleInputChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDestination} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Destination Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the destination "{destinationToDelete?.name}"? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDestination} disabled={isDeleting}>
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
