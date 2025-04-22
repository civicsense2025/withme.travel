import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  const startMonth = startDate.toLocaleString("default", { month: "short" })
  const endMonth = endDate.toLocaleString("default", { month: "short" })
  const startDay = startDate.getDate()
  const endDay = endDate.getDate()
  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()

  // Same year
  if (startYear === endYear) {
    // Same month
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${startYear}`
    }
    // Different months, same year
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`
  }

  // Different years
  return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`
}
