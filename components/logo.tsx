import React from "react"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <span className={`flex items-center gap-1 ${className}`}>
      <span className="text-xl font-bold gradient-text">🤝 withme.travel</span>
    </span>
  )
}
