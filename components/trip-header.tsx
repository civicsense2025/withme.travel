import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"
import { formatDateRange } from "@/lib/utils"
import { PresenceIndicator } from "./presence-indicator"

interface TripHeaderProps {
  title: string
  destination: string
  startDate: string
  endDate: string
  memberCount: number
}

export function TripHeader({ title, destination, startDate, endDate, memberCount }: TripHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground mt-2">
          <div className="flex items-center">
            <MapPinIcon className="mr-1 h-4 w-4" />
            <span>{destination}</span>
          </div>
          <div className="flex items-center">
            <CalendarIcon className="mr-1 h-4 w-4" />
            <span>{formatDateRange(startDate, endDate)}</span>
          </div>
          <div className="flex items-center">
            <UsersIcon className="mr-1 h-4 w-4" />
            <span>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PresenceIndicator />
      </div>
    </div>
  )
}
