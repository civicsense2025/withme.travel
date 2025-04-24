"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, User, Tag, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    location: "",
    avatar_url: "",
  })

  const [interests, setInterests] = useState<string[]>([])
  const [newInterest, setNewInterest] = useState("")

  const [isLoadingUserData, setIsLoadingUserData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push("/login?redirect=/settings")
    }
  }, [user, isAuthLoading, router])

  // Fetch user data
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          setIsLoadingUserData(true)
          setError(null)

          const response = await fetch("/api/user/profile")

          if (!response.ok) {
            throw new Error("Failed to fetch user data")
          }

          const data = await response.json()

          setProfileData({
            name: data.name || "",
            bio: data.bio || "",
            location: data.location || "",
            avatar_url: data.avatar_url || "",
          })

          // Handle interests as an array
          setInterests(Array.isArray(data.interests) ? data.interests : [])
        } catch (err: any) {
          console.error("Error fetching user data:", err)
          setError(err.message || "Failed to load user data")
          toast({
            title: "Error",
            description: "Failed to load your profile data",
            variant: "destructive",
          })
        } finally {
          setIsLoadingUserData(false)
        }
      }

      fetchUserData()
    }
  }, [user, toast])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInterest.trim()) return

    if (!interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()])
    }

    setNewInterest("")
  }

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest))
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profileData,
          interests,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "profile updated",
        description: "your profile has been updated successfully",
      })
    } catch (err: any) {
      console.error("Error updating profile:", err)
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Don't render anything while checking auth
  if (isAuthLoading) {
    return null
  }

  // Handle case where user is definitely not logged in after loading check
  if (!user) {
    return <p>Please log in to view settings.</p>
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 lowercase">settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="lowercase">
            profile
          </TabsTrigger>
          <TabsTrigger value="interests" className="lowercase">
            interests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="lowercase">your profile</CardTitle>
              <CardDescription className="lowercase">update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingUserData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profileData.avatar_url || ""} alt={profileData.name} />
                      <AvatarFallback>
                        <User className="h-8 w-8 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{profileData.name || user.email}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="tell us a bit about yourself"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleProfileChange}
                      placeholder="where are you based?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">avatar url</Label>
                    <Input
                      id="avatar_url"
                      name="avatar_url"
                      value={profileData.avatar_url}
                      onChange={handleProfileChange}
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="text-xs text-muted-foreground">enter a URL to an image for your profile picture</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={isLoadingUserData || isSaving} className="gap-2 lowercase">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="interests">
          <Card>
            <CardHeader>
              <CardTitle className="lowercase">travel interests</CardTitle>
              <CardDescription className="lowercase">what do you love about traveling?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingUserData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <form onSubmit={handleAddInterest} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="add a travel interest (e.g., hiking, food, museums)"
                      />
                    </div>
                    <Button type="submit">add</Button>
                  </form>

                  <div>
                    <Label className="mb-2 block">your interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {interests.length === 0 ? (
                        <p className="text-sm text-muted-foreground">no interests added yet</p>
                      ) : (
                        interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="pl-2 pr-1 py-1.5 gap-1">
                            <Tag className="h-3 w-3" />
                            <span>{interest}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 ml-1 hover:bg-transparent"
                              onClick={() => handleRemoveInterest(interest)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      these interests help us suggest trips and activities you might enjoy
                    </p>
                  </div>

                  <div className="border rounded-md p-4 bg-muted/20">
                    <h4 className="font-medium mb-2 lowercase">suggested interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "hiking",
                        "beaches",
                        "food",
                        "museums",
                        "nightlife",
                        "shopping",
                        "history",
                        "architecture",
                        "nature",
                        "photography",
                      ].map(
                        (suggestion) =>
                          !interests.includes(suggestion) && (
                            <Badge
                              key={suggestion}
                              variant="outline"
                              className="cursor-pointer hover:bg-secondary"
                              onClick={() => setInterests([...interests, suggestion])}
                            >
                              + {suggestion}
                            </Badge>
                          ),
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={isLoadingUserData || isSaving} className="gap-2 lowercase">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
