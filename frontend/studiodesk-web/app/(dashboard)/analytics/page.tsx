import { AnalyticsShell } from "@/components/analytics/AnalyticsShell"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Analytics | StudioDesk",
  description: "Track your studio performance across Indian fiscal bounds smoothly.",
}

export default function AnalyticsIndex() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse font-mono tracking-widest uppercase text-[10px]">Loading Primary BI Engine...</div>}>
      <AnalyticsShell />
    </Suspense>
  )
}