import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "support us | withme.travel",
  description: "Get help with your group travel planning or support our project",
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 