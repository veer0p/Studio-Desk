"use client"

import useSWR from "swr"
import { fetchTeamSchedule, fetchTeamMembers, ScheduleAssignment, TeamMember } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Calendar } from "lucide-react"

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function getWeekDates() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return {
      date: d,
      label: DAYS_OF_WEEK[i],
      num: d.getDate(),
      month: d.getMonth(),
      year: d.getFullYear(),
    }
  })
}

export function TeamSchedule() {
  const weekDates = getWeekDates()
  const weekStart = weekDates[0]?.date.toISOString().split("T")[0] ?? ""

  const { data: schedule, isLoading: scheduleLoading } = useSWR(
    weekStart ? `/api/v1/team/schedule?week=${weekStart}` : null,
    fetchTeamSchedule
  )
  const { data: teamData } = useSWR("/api/v1/team", fetchTeamMembers, { revalidateOnFocus: false })

  const team = teamData?.list || []
  const assignments = schedule || []

  if (scheduleLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-48 mb-6" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-3" />
        ))}
      </div>
    )
  }

  if (!assignments.length) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
        <Calendar className="w-12 h-12 mb-4 opacity-30" />
        <p className="font-medium text-foreground mb-1">No schedule conflicts this week</p>
        <p className="text-sm">Team assignments will appear here when bookings are scheduled.</p>
      </div>
    )
  }

  // Detect double-bookings: same member assigned to multiple events on same day
  const dayMemberMap = new Map<string, string[]>()
  assignments.forEach((a) => {
    const key = `${a.date}-${a.memberId}`
    if (!dayMemberMap.has(key)) dayMemberMap.set(key, [])
    dayMemberMap.get(key)!.push(a.bookingTitle)
  })

  const conflicts = Array.from(dayMemberMap.entries())
    .filter(([, bookings]) => bookings.length > 1)
    .map(([key, bookings]) => ({
      key,
      memberId: key.split("-").slice(1).join("-"),
      bookings,
    }))

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">This Week&apos;s Schedule</h3>
        {conflicts.length > 0 && (
          <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold">
            <AlertTriangle className="w-3 h-3" />
            {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border border-border/40 rounded-md">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 font-medium text-muted-foreground text-[10px] uppercase tracking-widest">Member</th>
              {weekDates.map((d) => (
                <th key={d.label} className="px-4 py-3 font-medium text-muted-foreground text-[10px] uppercase tracking-widest text-center">
                  {d.label} {d.num}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {team.map((member: TeamMember) => (
              <tr key={member.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 font-medium">{member.name}</td>
                {weekDates.map((d) => {
                  const dateStr = `${d.year}-${String(d.month + 1).padStart(2, "0")}-${String(d.num).padStart(2, "0")}`
                  const dayAssignments = assignments.filter(
                    (a: ScheduleAssignment) => a.memberId === member.id && a.date === dateStr
                  )
                  const hasConflict = dayAssignments.length > 1

                  return (
                    <td key={d.label} className="px-4 py-3 text-center">
                      {dayAssignments.length === 0 ? (
                        <span className="text-muted-foreground opacity-30">—</span>
                      ) : (
                        <div className={`space-y-1 ${hasConflict ? "text-amber-600" : "text-foreground"}`}>
                          {dayAssignments.map((a: ScheduleAssignment) => (
                            <div key={a.bookingId} className="text-[10px] font-mono tracking-wider truncate" title={a.bookingTitle}>
                              {a.eventType}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
