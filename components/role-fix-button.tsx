"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RoleFixButtonProps {
  tripId: string
  onRoleFixed: () => void
}

export function RoleFixButton({ tripId, onRoleFixed }: RoleFixButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fixRole = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/trips/${tripId}/role-fix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fix role")
      }
      
      toast({
        title: "Role Check Complete",
        description: data.message
      })
      
      // If the role was actually updated, refresh the page or component
      if (data.previousRole && data.newRole) {
        toast({
          title: "Role Updated",
          description: `Your role was updated from ${data.previousRole} to ${data.newRole}`
        })
        
        // Call the callback to refresh the parent component
        onRoleFixed()
      }
    } catch (error: any) {
      console.error("Error fixing role:", error)
      setError(error.message || "Failed to fix role")
      toast({
        title: "Error",
        description: error.message || "Failed to fix role",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button 
        variant="outline" 
        onClick={fixRole} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Checking role..." : "Fix Permission Issues"}
      </Button>
    </div>
  )
} 