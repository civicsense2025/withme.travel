import Link from "next/link"

interface LogoProps {
  className?: string
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-1 ${className}`}>
      <span className="text-xl font-bold gradient-text">🤝 withme.travel</span>
    </Link>
  )
}
