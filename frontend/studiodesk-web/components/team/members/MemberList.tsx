"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MemberCard } from "./MemberCard"

import useSWR from "swr"
import { fetchTeamMembers, TeamMember } from "@/lib/api"

export function MemberList() {
  const [search, setSearch] = useState("")
  const { data, isLoading } = useSWR("/api/v1/team", fetchTeamMembers)

  const members = data?.list || []
  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.role.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded-md bg-muted/20 animate-pulse border border-border/40" />
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-8">
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[320px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name, role..." 
            className="pl-9 bg-background border-border/60 shadow-sm rounded-sm h-9 text-xs font-mono"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 max-sm:w-full">
          <Button variant="outline" className="bg-background max-sm:flex-1 rounded-sm h-9 text-[10px] font-mono font-bold tracking-widest uppercase border-border/60">
            <Filter className="w-3.5 h-3.5 mr-2" /> Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
        {filtered.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

    </div>
  )
}
