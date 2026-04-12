"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MemberList } from "@/components/team/members/MemberList"
import { InviteMemberDialog } from "@/components/team/members/InviteMemberDialog"
import { TeamSchedule } from "@/components/team/schedule/TeamSchedule"
import { PayoutList } from "@/components/team/payouts/PayoutList"
import useSWR from "swr"
import { fetchTeamMembers } from "@/lib/api"

export function TeamShell() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "members"

  const { data: teamData } = useSWR("/api/v1/team", fetchTeamMembers, { revalidateOnFocus: false })
  const memberCount = teamData?.count ?? 0

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/team?${params.toString()}`, { scroll: false })
  }

  const tabs = [
    { id: "members", label: "Members Directory" },
    { id: "schedule", label: "Schedule Conflicts" },
    { id: "payouts", label: "Payout Registry" },
  ]

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">

      {/* Dynamic Master Header */}
      <div className="px-8 pt-8 pb-4 shrink-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Team & HR</h1>
              <span className="px-2.5 py-1 rounded-sm bg-muted border border-border/60 text-[10px] font-mono font-bold tracking-widest uppercase">{memberCount} Members</span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">Organize availability, detect shoot conflicts, and map TDS validations actively.</p>
          </div>

          <div className="flex items-center gap-3">
            <InviteMemberDialog>
              <Button className="rounded-sm font-mono text-[11px] font-bold tracking-widest uppercase px-6">
                <Plus className="w-3.5 h-3.5 mr-2" />
                Invite Member
              </Button>
            </InviteMemberDialog>
          </div>
        </div>

        <div className="flex sm:space-x-4 overflow-x-auto border-b border-border/40 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`pb-3 pt-1 px-4 text-[10px] font-mono font-bold tracking-widest uppercase whitespace-nowrap transition-colors border-b-2
                ${currentTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/5 custom-scrollbar relative">
        {currentTab === "members" && <MemberList />}
        {currentTab === "schedule" && <TeamSchedule />}
        {currentTab === "payouts" && <PayoutList />}
      </div>
    </div>
  )
}
