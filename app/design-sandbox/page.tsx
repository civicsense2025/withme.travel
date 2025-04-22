import { Metadata } from "next"
import DesignSandbox from "../design-sandbox"

export const metadata: Metadata = {
  title: "Design Sandbox | withme.travel",
  description: "A sandbox for exploring Tiptap-inspired design elements",
}

export default function DesignSandboxPage() {
  return <DesignSandbox />
} 