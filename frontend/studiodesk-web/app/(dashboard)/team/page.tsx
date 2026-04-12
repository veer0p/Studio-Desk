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
      <Suspense fallback={
        <div className="flex items-center justify-center h-full p-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <TeamShell />
      </Suspense>
    </div>
  )
}