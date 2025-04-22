import type { ReactNode } from "react"

interface PageHeaderProps {
  heading: string
  description?: string
  children?: ReactNode
}

export function PageHeader({ heading, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight lowercase">{heading}</h1>
        {description && <p className="text-muted-foreground lowercase">{description}</p>}
      </div>
      {children}
    </div>
  )
}
