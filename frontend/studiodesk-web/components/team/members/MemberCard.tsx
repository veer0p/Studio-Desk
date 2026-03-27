"use client"

import { AvailabilityDot } from "@/components/team/shared/AvailabilityDot"
import { RoleBadge } from "@/components/team/shared/RoleBadge"
import { CalendarPlus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function MemberCard({ member }: { member: any }) {
  const router = useRouter()
  
  // Format Indian currency securely bypassing TS strict validations safely
  const formatINR = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)

  return (
    <div 
      onClick={() => router.push(`/team/${member.id}`)}
      className="group relative flex flex-col bg-card rounded-xl border border-border/60 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="p-5 flex items-start gap-4">
        {/* Avatar Matrix */}
        <div className="relative">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: member.colorHash }}
          >
            {member.initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 bg-card rounded-full p-0.5 border border-transparent">
            <AvailabilityDot status={member.availability} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">{member.name}</h3>
          <p className="text-xs text-muted-foreground truncate mb-1">{member.designation}</p>
          <RoleBadge role={member.role} />
        </div>
      </div>

      <div className="px-5 pb-5">
        <p className="text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors inline-flex cursor-pointer mb-4" onClick={(e) => { e.stopPropagation(); window.open(`tel:${member.phone}`)}}>
          {member.phone}
        </p>

        <div className="flex items-center justify-between border-y border-border/40 py-3 mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Shoots (Oct)</span>
            <span className="text-sm font-medium text-foreground">{member.shootsThisMonth}</span>
          </div>
          <div className="w-[1px] h-8 bg-border/40" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Pending Payout</span>
            <span className={`text-sm font-bold ${member.pendingPayout > 0 ? 'text-amber-600' : 'text-foreground'}`}>
              {formatINR(member.pendingPayout)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full text-xs h-8 bg-muted/10" onClick={(e) => e.stopPropagation()}>
            View Profile
          </Button>
          <Button variant="default" className="w-full text-xs h-8" onClick={(e) => e.stopPropagation()}>
            <CalendarPlus className="w-3.5 h-3.5 mr-1.5" /> Assign
          </Button>
        </div>
      </div>
    </div>
  )
}
