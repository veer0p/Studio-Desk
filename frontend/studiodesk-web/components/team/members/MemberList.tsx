"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MemberCard } from "./MemberCard"

export function MemberList() {
  const [search, setSearch] = useState("")

  const mockMembers = [
    {
      id: "m-001", name: "Rahul Sharma", initials: "RS", colorHash: "#ec4899", 
      role: "Owner", designation: "Lead Photographer & Founder", 
      phone: "+91 98765 43210", availability: "available",
      shootsThisMonth: 14, pendingPayout: 0
    },
    {
      id: "m-002", name: "Vikram Singh", initials: "VS", colorHash: "#3b82f6", 
      role: "Videographer", designation: "Cinematic Film Director", 
      phone: "+91 87654 32109", availability: "partial",
      shootsThisMonth: 8, pendingPayout: 45000
    },
    {
      id: "m-003", name: "Ananya Patel", initials: "AP", colorHash: "#10b981", 
      role: "Editor", designation: "Colorist & Post-Production", 
      phone: "+91 76543 21098", availability: "available",
      shootsThisMonth: 0, pendingPayout: 12500
    },
    {
      id: "m-004", name: "Karan Desai", initials: "KD", colorHash: "#f59e0b", 
      role: "Drone Operator", designation: "Aerial Specialist", 
      phone: "+91 65432 10987", availability: "partial",
      shootsThisMonth: 5, pendingPayout: 25000
    },
    {
      id: "m-005", name: "Amit Verma", initials: "AV", colorHash: "#8b5cf6", 
      role: "Freelancer", designation: "Second Shooter", 
      phone: "+91 54321 09876", availability: "unavailable",
      shootsThisMonth: 2, pendingPayout: 8000
    }
  ]

  const filtered = mockMembers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="h-full flex flex-col p-8">
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-[320px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search by name, role..." 
            className="pl-9 bg-background border-border/60 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 max-sm:w-full">
          <Button variant="outline" className="bg-background max-sm:flex-1">
            <Filter className="w-4 h-4 mr-2" /> Role Filters
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
