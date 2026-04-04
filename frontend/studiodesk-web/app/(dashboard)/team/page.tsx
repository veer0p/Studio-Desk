import { Suspense } from "react"
import { TeamShell } from "@/components/team/TeamShell"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Team & HR | StudioDesk",
  description: "Manage freelancers, schedules, and payroll.",
}

export default function TeamPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading Team HQ...</div>}>
        <TeamShell />
      </Suspense>
    </div>
  )
}