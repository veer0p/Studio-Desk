import { AnalyticsShell } from "@/components/analytics/AnalyticsShell"
import { Suspense } from "react"

export const metadata = {
  title: "Analytics | StudioDesk",
  description: "Track your studio performance across Indian fiscal bounds smoothly.",
}

export default function AnalyticsIndex() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading BI Module...</div>}>
      <AnalyticsShell />
    </Suspense>
  )
}