import { MapPin, Calendar, Users, Tag } from "lucide-react"
import { format, parseISO } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from '@/lib/utils'

// Define the structure of a member with profile data expected from the page
interface MemberWithProfile {
  profiles: {
    id: string
    name: string | null
    avatar_url: string | null
    username: string | null
  } | null
  // Include other member fields if needed
}

// Define the props for the TripHeader component
export interface TripHeaderProps {
  title: string
  description?: string | null
  tags?: string[] | null
  destination: string
  startDate: string | null
  endDate: string | null
  members: MemberWithProfile[] // Array of members with profile info
}

// Helper function to format the date range string
function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "Date not set"
  try {
    const startDate = parseISO(start)
    const startFormat = "MMM d"
    const fullFormat = "MMM d, yyyy"

    if (!end) return format(startDate, fullFormat)

    const endDate = parseISO(end)
    if (startDate.getFullYear() !== endDate.getFullYear()) {
      return `${format(startDate, fullFormat)} - ${format(endDate, fullFormat)}`
    }
    if (startDate.getMonth() !== endDate.getMonth()) {
      return `${format(startDate, startFormat)} - ${format(endDate, fullFormat)}`
    }
    if (startDate.getDate() !== endDate.getDate()) {
      return `${format(startDate, startFormat)} - ${format(endDate, "d, yyyy")}`
    }
    return format(startDate, fullFormat)
  } catch (error) {
    console.error("Error parsing date:", error)
    return "Invalid date"
  }
}

// Sub-component to render overlapping member avatars
function MemberAvatars({ members }: { members: MemberWithProfile[] }) {
  if (!members || members.length === 0) {
    return <span className="text-sm">0 members</span>
  }

  const maxVisible = 5 // Show max 5 avatars + count indicator
  const visibleMembers = members.slice(0, maxVisible)
  const hiddenCount = members.length - visibleMembers.length

  return (
    <div className="flex items-center -space-x-2" title={`${members.length} member${members.length !== 1 ? 's' : ''}`}>
      {visibleMembers.map((member, index) => {
        const profile = member.profiles
        // Skip rendering if profile is null or essential data is missing
        if (!profile?.id) return null
        
        const name = profile.name || profile.username || 'User'
        const initials = getInitials(name)
        
        return (
          <Avatar key={profile.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-background" title={name}>
            <AvatarImage src={profile.avatar_url || undefined} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        )
      })}
      {hiddenCount > 0 && (
        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground text-xs font-medium ring-2 ring-background z-10">
          +{hiddenCount}
        </div>
      )}
    </div>
  )
}

// Main TripHeader component
export function TripHeader({ 
  title, 
  description, 
  tags, 
  destination, 
  startDate, 
  endDate, 
  members 
}: TripHeaderProps) {
  return (
    <div className="space-y-2">
      {/* Trip Title */}
      <h1 className="text-3xl font-bold tracking-tight break-words">{title}</h1>
      
      {/* Trip Description (Optional) */}
      {description && (
        <p className="text-muted-foreground text-base mt-1">
          {description}
        </p>
      )}
      
      {/* Trip Tags (Optional) */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Meta Info Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground pt-2">
        <span className="flex items-center">
          <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {destination}
        </span>
        <span className="flex items-center">
          <Calendar className="mr-1.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {formatDateRange(startDate, endDate)}
        </span>
        <span className="flex items-center">
          <Users className="mr-1.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <MemberAvatars members={members} />
        </span>
      </div>
    </div>
  )
}
