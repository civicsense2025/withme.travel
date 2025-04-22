"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Search, UserCog, Trash } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  created_at: string
  is_admin: boolean
  last_sign_in_at: string | null
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data: users, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setUsers(users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const openEditDialog = (user: User) => {
    setUserToEdit(user)
    setIsAdmin(user.is_admin)
    setEditDialogOpen(true)
  }

  const confirmDelete = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!userToEdit) return

    setIsSaving(true)
    try {
      // Update user in database
      const { error } = await supabase.from("users").update({ is_admin: isAdmin }).eq("id", userToEdit.id)

      if (error) throw error

      // Update UI
      setUsers(users.map((user) => (user.id === userToEdit.id ? { ...user, is_admin: isAdmin } : user)))
      setEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      // Delete user from database
      const { error } = await supabase.from("users").delete().eq("id", userToDelete.id)

      if (error) throw error

      // Update UI
      setUsers(users.filter((user) => user.id !== userToDelete.id))
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Users</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." className="pl-8" value={searchTerm} onChange={handleSearch} />
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
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.name || "N/A"}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => openEditDialog(user)}>
                          <UserCog className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => confirmDelete(user)}>
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user permissions for {userToEdit?.email}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Switch id="admin-mode" checked={isAdmin} onCheckedChange={setIsAdmin} />
              <Label htmlFor="admin-mode">Admin privileges</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the user {userToDelete?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
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
