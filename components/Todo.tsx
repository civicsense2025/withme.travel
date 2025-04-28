'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { 
  ThumbsUp, 
  ThumbsDown, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Ban, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Clock
} from 'lucide-react'

// Helper function to get initials from a name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

interface TodoItem {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed' | 'cancelled' | null
  dueDate?: string | null
  priority?: 'high' | 'medium' | 'low' | null
  votes: {
    up: number
    down: number
    upVoters: ProfileBasic[]
    downVoters: ProfileBasic[]
    userVote: 'up' | 'down' | null
  }
}

interface ProfileBasic {
  id: string
  name: string | null
  avatar_url: string | null
  username: string | null
}

interface TodoProps {
  initialItems: TodoItem[]
  canEdit: boolean
}

export function Todo({ initialItems, canEdit }: TodoProps) {
  const { toast } = useToast()
  const [items, setItems] = useState<TodoItem[]>(initialItems)
  const [expandedVoteItemId, setExpandedVoteItemId] = useState<string | null>(null)
  const [updatingStatusItemId, setUpdatingStatusItemId] = useState<string | null>(null)

  const handleVote = async (itemId: string, voteType: 'up' | 'down') => {
    const originalItems = [...items]
    
    // Find current user vote (if any)
    const item = items.find(i => i.id === itemId)
    if (!item) return
    
    const currentVote = item.votes.userVote
    
    // Optimistic UI update
    setItems(currentItems => 
      currentItems.map(item => {
        if (item.id !== itemId) return item
        
        // Creating a deep copy of the votes to modify
        const newVotes = { ...item.votes }
        
        // Case 1: User has not voted yet
        if (!currentVote) {
          if (voteType === 'up') {
            newVotes.up += 1
            // Add user to upVoters (would need actual user info)
          } else {
            newVotes.down += 1
            // Add user to downVoters (would need actual user info)
          }
        } 
        // Case 2: User is changing their vote
        else if (currentVote !== voteType) {
          if (voteType === 'up') {
            newVotes.up += 1
            newVotes.down -= 1
            // Move user from downVoters to upVoters
          } else {
            newVotes.up -= 1
            newVotes.down += 1
            // Move user from upVoters to downVoters
          }
        }
        // Case 3: User is removing their vote (clicking same button)
        else if (currentVote === voteType) {
          if (voteType === 'up') {
            newVotes.up -= 1
            // Remove user from upVoters
          } else {
            newVotes.down -= 1
            // Remove user from downVoters
          }
          // Use null for vote removal
          newVotes.userVote = null
          return { ...item, votes: newVotes }
        }
        
        // Update userVote with new state for other cases
        newVotes.userVote = voteType
        
        return { ...item, votes: newVotes }
      })
    )
    
    // In a real implementation, you would call your API here
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Success case would be handled here
      
    } catch (error) {
      console.error("Error voting:", error)
      // Revert optimistic update on error
      setItems(originalItems)
      toast({ 
        title: "Error Voting", 
        description: error instanceof Error ? error.message : "Could not record vote.", 
        variant: "destructive" 
      })
    }
  }

  const handleStatusUpdate = async (itemId: string, newStatus: 'completed' | 'cancelled') => {
    setUpdatingStatusItemId(itemId) // Indicate loading state for this item
    const originalItems = [...items]

    // Optimistic UI Update
    setItems(currentItems =>
      currentItems.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    )

    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast({ title: "Status Updated", description: `Todo status set to ${newStatus}.` })
      // Optimistic update was successful

    } catch (error) {
      console.error("Error updating status:", error)
      setItems(originalItems) // Revert optimistic update on error
      toast({ 
        title: "Error Updating Status", 
        description: error instanceof Error ? error.message : "Could not update todo status.", 
        variant: "destructive" 
      })
    } finally {
      setUpdatingStatusItemId(null) // Clear loading state regardless of outcome
    }
  }

  const renderVoters = (voters: ProfileBasic[]) => {
    // Only render if expanded
    if (!voters || voters.length === 0) return null
    return (
      <div className="flex -space-x-2 overflow-hidden ml-1">
        {voters.slice(0, 5).map((voter) => (
          <Avatar key={voter.id} className="inline-block h-5 w-5 rounded-full ring-1 ring-white" title={voter.name || voter.username || 'User'}>
            <AvatarImage src={voter.avatar_url || undefined} alt={voter.name || voter.username || 'User'} />
            <AvatarFallback className="text-[8px]">{getInitials(voter.name || voter.username || 'U')}</AvatarFallback>
          </Avatar>
        ))}
        {voters.length > 5 && (
          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 text-gray-600 text-[9px] font-medium ring-1 ring-white">
            +{voters.length - 5}
          </div>
        )}
      </div>
    )
  }

  if (!items || items.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No todo items added yet.</p>
  }

  const getStatusBadge = (status: 'pending' | 'completed' | 'cancelled' | null) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="secondary" className="ml-2 border-green-600/40 bg-green-500/10 text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        )
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="ml-2">
            <AlertCircle className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
    }
  }

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low' | null | undefined) => {
    if (!priority) return null
    
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="ml-2 border-red-600/40 bg-red-500/10 text-red-700 dark:text-red-400">
            High
          </Badge>
        )
      case 'medium':
        return (
          <Badge variant="outline" className="ml-2 border-orange-600/40 bg-orange-500/10 text-orange-700 dark:text-orange-400">
            Medium
          </Badge>
        )
      case 'low':
        return (
          <Badge variant="outline" className="ml-2 border-blue-600/40 bg-blue-500/10 text-blue-700 dark:text-blue-400">
            Low
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {items.map((item) => {
        const isExpanded = expandedVoteItemId === item.id
        return (
          <Card key={item.id} className={cn(item.status === 'cancelled' && 'opacity-60')}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center flex-wrap">
                    {item.title}
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {item.description}
                    {item.dueDate && (
                      <div className="text-xs text-muted-foreground mt-2 flex items-center">
                        <Clock className="h-3 w-3 mr-1"/> Due: {item.dueDate}
                      </div>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center justify-between border-t pt-3">
                <button 
                  type="button"
                  onClick={() => setExpandedVoteItemId(isExpanded ? null : item.id)}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-1">
                    <ThumbsUp className={`h-4 w-4 ${item.votes.userVote === 'up' ? 'text-primary' : ''}`} />
                    <span>{item.votes.up}</span>
                    {isExpanded && renderVoters(item.votes.upVoters)}
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsDown className={`h-4 w-4 ${item.votes.userVote === 'down' ? 'text-destructive' : ''}`} />
                    <span>{item.votes.down}</span>
                    {isExpanded && renderVoters(item.votes.downVoters)}
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {isExpanded && canEdit && item.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" size="sm"
                      className="h-auto p-1.5 text-green-600 border-green-600/40 hover:bg-green-500/10"
                      onClick={() => handleStatusUpdate(item.id, 'completed')}
                      disabled={updatingStatusItemId === item.id}
                    >
                      {updatingStatusItemId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      <span className="ml-1 hidden sm:inline">Complete</span>
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      className="h-auto p-1.5 text-red-600 border-red-600/40 hover:bg-red-500/10"
                      onClick={() => handleStatusUpdate(item.id, 'cancelled')}
                      disabled={updatingStatusItemId === item.id}
                    >
                      {updatingStatusItemId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                      <span className="ml-1 hidden sm:inline">Cancel</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 