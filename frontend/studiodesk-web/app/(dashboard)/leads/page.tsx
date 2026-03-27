import { Suspense } from "react"
import LeadsClient from "@/components/leads/LeadsClient"

export const metadata = {
  title: "Leads | StudioDesk",
  description: "Manage your early-stage inquiries and leads",
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string, view?: string }>
}) {
  const params = await searchParams
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full w-full bg-background">
        <div className="text-[10px] font-mono tracking-widest uppercase animate-pulse">Initializing Leads Pipeline...</div>
      </div>
    }>
      <LeadsClient search={params.search || ""} view={params.view || "kanban"} />
    </Suspense>
  )
}
