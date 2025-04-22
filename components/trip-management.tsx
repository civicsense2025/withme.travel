"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Settings, Trash2, Share2, Lock, Globe, UserPlus, Mail, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

interface Member {
  id: string
  name: string
  email: string
  avatar_url?: string
  role: "owner" | "admin" | "member"
  status: "active" | "pending"
}

interface TripManagementProps {
  tripId: string
}

export function TripManagement({ tripId }: TripManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [trip, setTrip] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPublic, setIsPublic] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [publicLink, setPublicLink] = useState("")
  const [isOwner, setIsOwner] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedTrip, setEditedTrip] = useState<any>({})

  // Fetch trip data and members
  useEffect(() => {
    async function fetchTripAndMembers() {
      try {
        setIsLoading(true)

        // Fetch trip details
        const tripResponse = await fetch(`/api/trips/${tripId}`)
        if (!tripResponse.ok) throw new Error("Failed to fetch trip")
        const tripData = await tripResponse.json()

        setTrip(tripData.trip)
        setIsPublic(tripData.trip.is_public || false)
        setPublicLink(
          tripData.trip.public_slug ? `${window.location.origin}/trips/public/${tripData.trip.public_slug}` : "",
        )

        // Initialize edited trip data
        setEditedTrip({
          name: tripData.trip.name,
          description: tripData.trip.description,
          start_date: tripData.trip.start_date,
          end_date: tripData.trip.end_date,
        })

        // Fetch members
        const membersResponse = await fetch(`/api/trips/${tripId}/members`)
        if (!membersResponse.ok) throw new Error("Failed to fetch members")
        const membersData = await membersResponse.json()

        setMembers(membersData.members)

        // Check if current user is owner or admin
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const currentUserMember = membersData.members.find((m: any) => m.id === user?.id)
        setIsOwner(currentUserMember?.role === "owner")
        setIsAdmin(currentUserMember?.role === "admin" || currentUserMember?.role === "owner")
      } catch (error) {
        console.error("Error fetching trip data:", error)
        toast({
          title: "Error",
          description: "Failed to load trip management data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTripAndMembers()
  }, [tripId, toast])

  // Toggle public/private status
  const togglePublicStatus = async () => {
    try {
      const newStatus = !isPublic
      setIsPublic(newStatus)

      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_public: newStatus,
          // Generate a slug if making public and no slug exists
          public_slug:
            newStatus && !trip.public_slug
              ? `${trip.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`
              : trip.public_slug,
        }),
      })

      if (!response.ok) throw new Error("Failed to update trip visibility")

      const updatedTrip = await response.json()
      setTrip(updatedTrip.trip)

      if (newStatus && updatedTrip.trip.public_slug) {
        setPublicLink(`${window.location.origin}/trips/public/${updatedTrip.trip.public_slug}`)
      }

      toast({
        title: "Success",
        description: `Trip is now ${newStatus ? "public" : "private"}`,
      })
    } catch (error) {
      console.error("Error toggling public status:", error)
      setIsPublic(!isPublic) // Revert UI state
      toast({
        title: "Error",
        description: "Failed to update trip visibility",
        variant: "destructive",
      })
    }
  }

  // Invite a new member
  const inviteMember = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/members/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      })

      if (!response.ok) throw new Error("Failed to send invitation")

      toast({
        title: "Invitation sent",
        description: `Invitation email sent to ${inviteEmail}`,
      })

      setInviteEmail("")

      // Refresh members list
      const membersResponse = await fetch(`/api/trips/${tripId}/members`)
      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        setMembers(membersData.members)
      }
    } catch (error) {
      console.error("Error inviting member:", error)
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      })
    }
  }

  // Update member role
  const updateMemberRole = async (memberId: string, newRole: "admin" | "member") => {
    try {
      const response = await fetch(`/api/trips/${tripId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) throw new Error("Failed to update member role")

      // Update local state
      setMembers(members.map((member) => (member.id === memberId ? { ...member, role: newRole } : member)))

      toast({
        title: "Role updated",
        description: `Member role updated to ${newRole}`,
      })
    } catch (error) {
      console.error("Error updating member role:", error)
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    }
  }

  // Remove a member
  const removeMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/members/${memberId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove member")

      // Update local state
      setMembers(members.filter((member) => member.id !== memberId))

      toast({
        title: "Member removed",
        description: "Member has been removed from the trip",
      })
    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  // Copy public link to clipboard
  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink)
    toast({
      title: "Link copied",
      description: "Public link copied to clipboard",
    })
  }

  // Save trip edits
  const saveTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedTrip),
      })

      if (!response.ok) throw new Error("Failed to update trip")

      const updatedTrip = await response.json()
      setTrip(updatedTrip.trip)
      setEditMode(false)

      toast({
        title: "Trip updated",
        description: "Trip details have been updated",
      })
    } catch (error) {
      console.error("Error updating trip:", error)
      toast({
        title: "Error",
        description: "Failed to update trip details",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="animate-pulse bg-muted h-8 w-3/4 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-muted h-4 w-1/2 rounded"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse bg-muted h-12 rounded"></div>
            <div className="animate-pulse bg-muted h-12 rounded"></div>
            <div className="animate-pulse bg-muted h-12 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{trip?.name}</CardTitle>
            <CardDescription>Trip Management</CardDescription>
          </div>
          {isAdmin && !editMode && (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Trip
            </Button>
          )}
          {editMode && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={saveTrip}>Save Changes</Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 pt-4">
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="trip-name">Trip Name</Label>
                  <Input
                    id="trip-name"
                    value={editedTrip.name}
                    onChange={(e) => setEditedTrip({ ...editedTrip, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="trip-description">Description</Label>
                  <Textarea
                    id="trip-description"
                    value={editedTrip.description || ""}
                    onChange={(e) => setEditedTrip({ ...editedTrip, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={editedTrip.start_date ? new Date(editedTrip.start_date).toISOString().split("T")[0] : ""}
                      onChange={(e) => setEditedTrip({ ...editedTrip, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={editedTrip.end_date ? new Date(editedTrip.end_date).toISOString().split("T")[0] : ""}
                      onChange={(e) => setEditedTrip({ ...editedTrip, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Trip Name</h3>
                  <p>{trip?.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Description</h3>
                  <p>{trip?.description || "No description"}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Start Date</h3>
                    <p>{trip?.start_date ? new Date(trip.start_date).toLocaleDateString() : "Not set"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">End Date</h3>
                    <p>{trip?.end_date ? new Date(trip.end_date).toLocaleDateString() : "Not set"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Destination</h3>
                  <p>{trip?.destination || "No destination set"}</p>
                </div>
              </div>
            )}

            {isOwner && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="mt-4">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Trip
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Trip</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this trip? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/trips/${tripId}`, {
                            method: "DELETE",
                          })

                          if (!response.ok) throw new Error("Failed to delete trip")

                          toast({
                            title: "Trip deleted",
                            description: "Trip has been permanently deleted",
                          })

                          router.push("/trips")
                        } catch (error) {
                          console.error("Error deleting trip:", error)
                          toast({
                            title: "Error",
                            description: "Failed to delete trip",
                            variant: "destructive",
                          })
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4 pt-4">
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  <Button onClick={inviteMember}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Members ({members.length})</h3>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={member.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{member.name?.charAt(0) || member.email.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name || member.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.role} • {member.status === "pending" ? "Invited" : "Active"}
                          </p>
                        </div>
                      </div>

                      {isAdmin && member.id !== trip?.owner_id && (
                        <div className="flex gap-2">
                          {isOwner && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMemberRole(member.id, member.role === "admin" ? "member" : "admin")}
                            >
                              {member.role === "admin" ? "Remove Admin" : "Make Admin"}
                            </Button>
                          )}
                          <Button size="sm" variant="destructive" onClick={() => removeMember(member.id)}>
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="public-mode" checked={isPublic} onCheckedChange={togglePublicStatus} disabled={!isAdmin} />
                <Label htmlFor="public-mode" className="flex items-center gap-2">
                  {isPublic ? (
                    <>
                      <Globe className="h-4 w-4" />
                      Public Trip
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Private Trip
                    </>
                  )}
                </Label>
              </div>

              <div className="text-sm text-muted-foreground">
                {isPublic
                  ? "Anyone with the link can view this trip without signing in."
                  : "Only invited members can access this trip."}
              </div>

              {isPublic && (
                <div className="pt-2">
                  <Label htmlFor="public-link">Public Link</Label>
                  <div className="flex mt-1 gap-2">
                    <Input id="public-link" value={publicLink} readOnly />
                    <Button variant="outline" onClick={copyPublicLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <Button variant="outline" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Email Link
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
