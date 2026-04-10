"use client"

import { AvailabilityDot } from "@/components/team/shared/AvailabilityDot"
import { RoleBadge } from "@/components/team/shared/RoleBadge"
import { CalendarPlus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

import { TeamMember } from "@/lib/api"

export function MemberCard({ member }: { member: TeamMember }) {
  const router = useRouter()

  const displayName = member.name || member.email || "Unknown Member"
  const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const formatPhone = (phone: string | null) => {
    if (!phone) return null
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
    }
    return phone
  }

  const formatJoined = (date: string | null) => {
    if (!date) return "—"
    const d = new Date(date)
    if (isNaN(d.getTime())) return "—"
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  return (
    <div
      onClick={() => router.push(`/team/${member.id}`)}
      className="group relative flex flex-col bg-card rounded-md border border-border/60 overflow-hidden shadow-sm hover:border-border transition-all cursor-pointer"
    >
      <div className="p-5 flex items-start gap-4">
        {/* Avatar Matrix */}
        <div className="relative shrink-0">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={displayName}
              className="w-14 h-14 rounded-md object-cover border border-border/40 grayscale"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-md flex items-center justify-center bg-muted text-muted-foreground font-bold text-lg border border-border/40"
            >
              {initials}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-card rounded-sm p-0.5 border border-border/40">
            <AvailabilityDot status={member.status === 'active' ? 'available' : member.status === 'invited' ? 'partial' : 'unavailable'} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold tracking-tight text-foreground truncate">{displayName}</h3>
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground truncate mb-2">{(member.skills ?? []).join(' • ') || member.role}</p>
          <RoleBadge role={member.role} />
        </div>
      </div>

      <div className="px-5 pb-5">
        {member.phone ? (
          <p className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors inline-flex cursor-pointer mb-4" onClick={(e) => { e.stopPropagation(); window.open(`tel:${member.phone}`)}}>
            {formatPhone(member.phone)}
          </p>
        ) : (
          <p className="text-[10px] font-mono text-muted-foreground/50 mb-4">No phone</p>
        )}

        <div className="flex items-center justify-between border-y border-border/40 py-3 mb-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold font-mono mb-0.5">Projects</span>
            <span className="text-[11px] font-mono font-bold text-foreground">{member.totalProjects || 0}</span>
          </div>
          <div className="w-[1px] h-6 bg-border/40" />
          <div className="flex flex-col text-right">
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold font-mono mb-0.5">Joined</span>
            <span className="text-[11px] font-mono font-bold text-foreground">
              {formatJoined(member.joinedAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <Button 
            variant="outline" 
            className="flex-1 min-w-0 text-[10px] h-8 bg-muted/10 rounded-sm font-mono font-bold tracking-widest uppercase truncate px-2" 
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/team/${member.id}`)
            }}
          >
            Profile
          </Button>
          <Button 
            variant="default" 
            className="flex-1 min-w-0 text-[10px] h-8 rounded-sm font-mono font-bold tracking-widest uppercase truncate px-2 whitespace-nowrap" 
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/bookings?assign=${member.id}`)
            }}
          >
            <CalendarPlus className="w-3 h-3 mr-1 shrink-0" /> Assign
          </Button>
        </div>
      </div>
    </div>
  )
}
