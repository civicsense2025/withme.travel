"use client"

import { useState, useEffect } from "react"
import { Mail, PlusCircle, Trash2, User, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface MembersTabProps {
  tripId: string
  canEdit?: boolean
  userRole?: string | null
}

interface AccessRequest {
  id: string
  user_id: string
  user: {
    name: string
    email: string
    avatar_url?: string
  }
  message?: string
  created_at: string
}

export function MembersTab({ tripId, canEdit = false, userRole = null }: MembersTabProps) {
  const [members, setMembers] = useState([
    { id: "1", name: "John Smith", email: "john@example.com", role: "Organizer", avatar: "/diverse-group-city.png" },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "Member",
      avatar: "/contemplative-artist.png",
    },
    {
      id: "3",
      name: "Mike Williams",
      email: "mike@example.com",
      role: "Member",
      avatar: "/placeholder.svg?key=iss0w",
    },
    {
      id: "4",
      name: "Lisa Brown",
      email: "lisa@example.com",
      role: "Member",
      avatar: "/placeholder.svg?key=i7tha",
    },
  ])

  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "Member",
  })
  const { toast } = useToast()
  const isAdmin = userRole === "owner" || userRole === "admin"

  // Fetch members and access requests
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch members
        const membersResponse = await fetch(`/api/trips/${tripId}/members`)
        if (membersResponse.ok) {
          const membersData = await membersResponse.json()
          setMembers(membersData.members)
        }

        // Fetch access requests if user is admin
        if (isAdmin) {
          const requestsResponse = await fetch(`/api/trips/${tripId}/access-requests`)
          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json()
            setAccessRequests(requestsData.requests || [])
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tripId, isAdmin])

  const handleAddMember = async () => {
    if (!newMember.email) {
      toast({
        title: "Email required",
        description: "Please enter an email address",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/trips/${tripId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newMember.email,
          name: newMember.name,
          role: newMember.role.toLowerCase(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add member")
      }

      const data = await response.json()

      // Update members list
      setMembers([...members, data.member])

      setIsAddMemberOpen(false)
      // Reset form
      setNewMember({
        name: "",
        email: "",
        role: "Member",
      })

      toast({
        title: "Member added",
        description: "Invitation has been sent",
      })
    } catch (error: any) {
      console.error("Error adding member:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add member",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (id: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/members/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to remove member")
      }

      // Update members list
      setMembers(members.filter((member) => member.id !== id))

      toast({
        title: "Member removed",
        description: "Member has been removed from the trip",
      })
    } catch (error: any) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const handleAccessRequest = async (requestId: string, approve: boolean) => {
    try {
      const response = await fetch(`/api/trips/${tripId}/access-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: approve ? "approved" : "denied",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to process request")
      }

      // Update access requests list
      setAccessRequests(accessRequests.filter((req) => req.id !== requestId))

      // If approved, refresh members list
      if (approve) {
        const membersResponse = await fetch(`/api/trips/${tripId}/members`)
        if (membersResponse.ok) {
          const membersData = await membersResponse.json()
          setMembers(membersData.members)
        }
      }

      toast({
        title: approve ? "Request approved" : "Request denied",
        description: approve ? "User now has edit access" : "Access request was denied",
      })
    } catch (error: any) {
      console.error("Error processing access request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Trip Members</CardTitle>
          <CardDescription>Manage the people in your travel group</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{member.role}</Badge>
                {canEdit && member.role !== "Organizer" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          {canEdit && (
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Trip Member</DialogTitle>
                  <DialogDescription>Invite someone to join your trip</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Member">Member</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMember}>Add Member</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>

      {isAdmin && accessRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Access Requests</CardTitle>
            <CardDescription>People requesting edit access to this trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accessRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.user.avatar_url || "/placeholder.svg"} alt={request.user.name} />
                      <AvatarFallback>{request.user.name?.charAt(0) || request.user.email.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.user.name || request.user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Requested {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleAccessRequest(request.id, false)}>
                      <X className="h-4 w-4 mr-1" />
                      Deny
                    </Button>
                    <Button size="sm" onClick={() => handleAccessRequest(request.id, true)}>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
                {request.message && (
                  <div className="mt-2 text-sm bg-muted p-3 rounded-md">
                    <p className="italic">{request.message}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invite Members</CardTitle>
          <CardDescription>Share this link with friends to invite them to your trip</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={`https://withme.travel/invite/${tripId}`} readOnly />
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(`https://withme.travel/invite/${tripId}`)
                toast({
                  title: "Link copied",
                  description: "Invitation link copied to clipboard",
                })
              }}
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
