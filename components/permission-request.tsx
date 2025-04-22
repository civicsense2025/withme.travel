"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Shield, Loader2 } from "lucide-react"

interface PermissionRequestProps {
  tripId: string
  tripName: string
}

export function PermissionRequest({ tripId, tripName }: PermissionRequestProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRequested, setIsRequested] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/trips/${tripId}/permissions/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          requestedRole: "editor", // Default to editor role
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit request")
      }

      setIsRequested(true)
      toast({
        title: "Request submitted",
        description: "Trip organizers have been notified of your request",
      })

      // Close dialog after a short delay
      setTimeout(() => {
        setIsOpen(false)
      }, 2000)
    } catch (error: any) {
      console.error("Error requesting permissions:", error)
      toast({
        title: "Request failed",
        description: error.message || "Failed to submit permission request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Shield className="h-4 w-4" />
          Request Edit Access
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Edit Access</DialogTitle>
          <DialogDescription>Ask the trip organizers for permission to edit "{tripName}"</DialogDescription>
        </DialogHeader>

        {isRequested ? (
          <div className="py-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground">Trip organizers will review your request soon.</p>
          </div>
        ) : (
          <>
            <div className="py-4">
              <p className="mb-4">
                Let the trip organizers know why you'd like to edit this trip. They'll be notified of your request.
              </p>
              <Textarea
                placeholder="I'd like to help plan this trip by adding some activities I found..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || message.trim().length < 5}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
