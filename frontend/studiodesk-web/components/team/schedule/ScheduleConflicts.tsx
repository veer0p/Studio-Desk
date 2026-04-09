"use client"

import { AlertTriangle, UserCheck } from "lucide-react"
import useSWR from "swr"
import { checkScheduleConflicts } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"

export function ScheduleConflicts({ weekStr }: { weekStr: string }) {
  const { data, isLoading, error } = useSWR(
    weekStr ? `/api/v1/team/conflicts?week=${weekStr}` : null,
    () => checkScheduleConflicts(weekStr)
  )

  if (isLoading) {
    return <Skeleton className="h-16 w-full rounded-md" />
  }

  if (error) {
    return null
  }

  const conflicts = data?.conflicts || []

  if (conflicts.length === 0) {
    return (
      <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-emerald-600">
        <UserCheck className="w-5 h-5" />
        <p className="text-sm font-medium">No scheduling conflicts detected for this week. All Clear.</p>
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 mb-2 text-amber-600">
        <AlertTriangle className="w-5 h-5" />
        <h3 className="font-semibold">Action Required: Schedule Conflicts ({conflicts.length})</h3>
      </div>

      {conflicts.map((c: any) => (
        <div key={c.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-medium text-amber-900">{c.member} — Double-booked on <span className="font-bold">{c.date}</span></p>
            <div className="text-sm text-amber-700/80 space-y-1 mt-2">
              <p>• Shoot 1: {c.shoot1.title} ({c.shoot1.time})</p>
              <p>• Shoot 2: {c.shoot2.title} ({c.shoot2.time})</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg text-sm transition-colors max-md:self-start">
            Resolve Conflict
          </button>
        </div>
      ))}
    </div>
  )
}
