"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScheduleConflicts } from "./ScheduleConflicts"

const mockTeam = [
  { id: "m1", name: "Rahul Sharma", role: "Owner" },
  { id: "m2", name: "Vikram Singh", role: "Videographer" },
  { id: "m3", name: "Ananya Patel", role: "Editor" },
  { id: "m4", name: "Karan Desai", role: "Drone Operator" }
]

const weekDays = ["Mon, 23", "Tue, 24", "Wed, 25", "Thu, 26", "Fri, 27", "Sat, 28", "Sun, 29"]

export function TeamSchedule() {
  const [view, setView] = useState<"week"|"month">("week")
  
  return (
    <div className="p-6 md:p-8 h-full flex flex-col w-full max-w-[1600px] mx-auto overflow-hidden">
      
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 bg-background"><ChevronLeft className="w-4 h-4" /></Button>
          <div className="px-4 py-1.5 bg-background border border-border/60 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm min-w-[200px] justify-center">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            Week of 23–29 Mar, 2026
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-background"><ChevronRight className="w-4 h-4" /></Button>
          <Button variant="secondary" className="ml-2 h-9">Today</Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-muted/60 rounded-lg border border-border/40">
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${view === 'week' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${view === 'month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Month
            </button>
          </div>
          <Button variant="outline" className="h-9 bg-background ml-2"><Filter className="w-4 h-4 mr-2" /> Filter Team</Button>
          <Button variant="outline" className="h-9 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"><Layers className="w-4 h-4 mr-2" /> Check Conflicts</Button>
        </div>
      </div>

      <div className="shrink-0">
        <ScheduleConflicts />
      </div>

      {/* Week Grid */}
      {view === "week" && (
        <div className="flex-1 min-h-0 bg-card border border-border/60 rounded-xl shadow-sm flex flex-col overflow-hidden">
          
          <div className="grid grid-cols-[160px_repeat(7,1fr)] lg:grid-cols-[220px_repeat(7,1fr)] border-b border-border/60 shrink-0 bg-muted/20">
            <div className="p-4 border-r border-border/60 font-semibold text-sm text-muted-foreground flex items-center">Team Member</div>
            {weekDays.map(d => (
              <div key={d} className={`p-4 font-semibold text-sm text-center flex flex-col lg:flex-row items-center justify-center gap-1 ${d.includes("Sat") || d.includes("Sun") ? 'text-primary' : 'text-foreground'}`}>
                {d.split(", ")[0]} <span className="text-muted-foreground font-normal ml-1">{d.split(", ")[1]}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {mockTeam.map((member, i) => (
              <div key={member.id} className="grid grid-cols-[160px_repeat(7,1fr)] lg:grid-cols-[220px_repeat(7,1fr)] border-b border-border/40 group relative">
                
                {/* Member Frozen Column */}
                <div className="p-4 border-r border-border/60 bg-muted/5 flex flex-col justify-center sticky left-0 z-10">
                  <span className="font-semibold text-sm truncate">{member.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{member.role}</span>
                </div>

                {/* Day Cells */}
                {weekDays.map((d, dIdx) => {
                  // MOCK ASSIGNMENTS LOGIC
                  const isConflict = i === 1 && dIdx === 1 // Vikram on Tuesday
                  const hasShoot = (i === 0 && dIdx === 4) || (i === 1 && dIdx === 1) || (i === 2 && dIdx === 5)
                  const hasDoubleShoot = (i === 1 && dIdx === 1)

                  return (
                    <div key={dIdx} className={`p-2 border-r border-border/20 last:border-r-0 min-h-[100px] transition-colors relative ${isConflict ? 'bg-amber-50/50' : 'hover:bg-muted/10'}`}>
                      {hasShoot && (
                        <div className="w-full flex justify-center mt-2 group/chip cursor-pointer">
                          <div className={`w-[90%] py-1.5 px-2 rounded-md border text-xs font-semibold truncate ${
                            isConflict ? 'bg-white border-amber-300 text-amber-800 shadow-sm' : 'bg-primary/10 border-primary/20 text-primary'
                          }`}>
                            Wedding: Rahul...
                            <span className="block text-[9px] font-normal mt-0.5 opacity-80">9:00 AM</span>
                          </div>
                        </div>
                      )}
                      {hasDoubleShoot && (
                         <div className="w-full flex justify-center mt-1 cursor-pointer">
                          <div className={`w-[90%] py-1.5 px-2 rounded-md border text-xs font-semibold truncate bg-white border-amber-300 text-amber-800 shadow-sm`}>
                            Corporate: M...
                            <span className="block text-[9px] font-normal mt-0.5 opacity-80">2:00 PM</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "month" && (
        <div className="flex-1 min-h-[400px] flex items-center justify-center bg-card rounded-xl border border-border/60 shadow-sm text-muted-foreground">
          Monthly aggregation matrix mapping offline.
        </div>
      )}

    </div>
  )
}
