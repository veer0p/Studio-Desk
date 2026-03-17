"use client";

import { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay 
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Users, 
  Filter,
  Plus,
  UnfoldVertical,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarEvent } from "@/components/team/CalendarEvent";
import { cn } from "@/lib/utils";

// Mock data for calendar
const mockEvents = [
  { id: "1", title: "Sharma Wedding", event_type: "wedding", event_date: "2025-03-15", call_time: "10:00 AM", venue_city: "Mumbai", assignments: [{ member_name: "Viraj", role: "Protog", is_confirmed: true }] },
  { id: "2", title: "Corporate: Google", event_type: "corporate", event_date: "2025-03-12", call_time: "09:00 AM", venue_city: "Bangalore", assignments: [{ member_name: "Sneha", role: "Protog", is_confirmed: false }] },
  { id: "3", title: "Priya Pre-wedding", event_type: "pre_wedding", event_date: "2025-03-15", call_time: "05:00 AM", venue_city: "Pune", assignments: [{ member_name: "Rahul", role: "Video", is_confirmed: true }] },
];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth))
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <CalendarIcon className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-3xl font-bold tracking-tight">{format(currentMonth, "MMMM yyyy")}</h1>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">Studio shoot schedule & team assignments.</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <Tabs value={view} onValueChange={(v: any) => setView(v)} className="bg-slate-100 p-1 rounded-xl h-11 hidden sm:flex">
              <TabsList className="bg-transparent">
                 <TabsTrigger value="month" className="rounded-lg h-9 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                    <LayoutGrid className="w-3.5 h-3.5 mr-2" /> Month
                 </TabsTrigger>
                 <TabsTrigger value="week" className="rounded-lg h-9 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                    <UnfoldVertical className="w-3.5 h-3.5 mr-2" /> Week
                 </TabsTrigger>
              </TabsList>
           </Tabs>
           
           <div className="flex bg-white border border-slate-100 rounded-xl p-1 shadow-sm h-11">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" className="h-9 rounded-lg px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary" onClick={() => setCurrentMonth(new Date())}>Today</Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
           </div>

           <Button className="h-11 px-6 rounded-xl font-bold bg-slate-900 shadow-xl shadow-slate-200 ml-2">
              <Plus className="w-4 h-4 mr-2" /> New Setup
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         {/* Calendar Grid */}
         <div className="xl:col-span-9 bg-white border border-slate-100 rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-50">
               {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                 <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/50">
                    {d}
                 </div>
               ))}
            </div>
            
            <div className="grid grid-cols-7 auto-rows-[minmax(140px,auto)] min-h-[700px]">
               {days.map((day, i) => {
                 const dayEvents = mockEvents.filter(e => isSameDay(new Date(e.event_date), day));
                 const isTodayDate = isSameDay(day, new Date());
                 const isCurrentMonth = isSameMonth(day, currentMonth);

                 return (
                   <div 
                     key={i} 
                     className={cn(
                       "relative border-b border-r border-slate-50 p-2 group hover:bg-slate-50/50 transition-colors",
                       !isCurrentMonth && "bg-slate-50/30 opacity-40",
                       isTodayDate && "bg-primary/5"
                     )}
                   >
                      <div className="flex justify-between items-start mb-2 px-1 py-1">
                         <span className={cn(
                           "text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                           isTodayDate ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "text-slate-400 group-hover:text-slate-900"
                         )}>
                            {format(day, "d")}
                         </span>
                         {dayEvents.length > 0 && (
                           <Badge variant="outline" className="h-5 text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-300 group-hover:bg-white group-hover:text-primary transition-all">
                             {dayEvents.length} {dayEvents.length === 1 ? 'Shoot' : 'Shoots'}
                           </Badge>
                         )}
                      </div>

                      <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide py-1">
                         {dayEvents.map(event => (
                           <CalendarEvent key={event.id} event={event as any} />
                         ))}
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>

         {/* Sidebar / Filters */}
         <aside className="xl:col-span-3 space-y-8">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-8 space-y-8 sticky top-8">
               <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                     <Filter className="w-4 h-4" /> Schedule Filters
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Filter shoots by team member or confirmation status.</p>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Shoot Types</h4>
                  <div className="space-y-3">
                     {['Wedding', 'Corporate', 'Birthday', 'Portrait'].map(type => (
                       <label key={type} className="flex items-center gap-3 cursor-pointer group">
                          <div className={cn("w-5 h-5 rounded-md border-2 border-slate-100 group-hover:border-primary transition-all flex items-center justify-center")}>
                             <div className="w-2.5 h-2.5 bg-primary rounded-sm opacity-0 group-hover:opacity-100" />
                          </div>
                          <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900">{type}</span>
                       </label>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Team Availability</h4>
                  <div className="space-y-4">
                     {[
                       { name: "Viraj Patel", role: "Owner", avatar: "" },
                       { name: "Sneha Rao", role: "Photo", avatar: "" },
                       { name: "Rahul Mehra", role: "Video", avatar: "" },
                     ].map(m => (
                       <div key={m.name} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-xl transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-[#2A7EC8] text-white flex items-center justify-center text-[10px] font-black">
                                {m.name.charAt(0)}
                             </div>
                             <div>
                                <div className="text-[10px] font-bold text-slate-900 leading-tight">{m.name}</div>
                                <div className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">{m.role}</div>
                             </div>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                       </div>
                     ))}
                  </div>
               </div>

               <Button variant="outline" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-slate-100 hover:bg-slate-50 hover:text-rose-500 transition-all">
                  Clear All Filters
               </Button>
            </Card>
         </aside>
      </div>
    </div>
  );
}
