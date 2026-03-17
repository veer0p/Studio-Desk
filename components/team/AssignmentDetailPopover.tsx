"use client";

import { 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  ArrowRight,
  UserPlus,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatIndianDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface AssignmentDetailPopoverProps {
  event: any;
}

export function AssignmentDetailPopover({ event }: AssignmentDetailPopoverProps) {
  return (
    <div className="space-y-0 text-slate-900">
      <div className="p-6 bg-slate-900 text-white space-y-4">
         <div className="flex justify-between items-start">
            <Badge className="bg-white/10 text-white backdrop-blur-md border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
               {event.event_type}
            </Badge>
            <div className="text-[10px] font-bold text-slate-400">{formatIndianDate(event.event_date)}</div>
         </div>
         <h1 className="text-xl font-black tracking-tight leading-tight">{event.title}</h1>
         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {event.venue_city}</div>
            <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {event.call_time}</div>
         </div>
      </div>

      <div className="p-6 space-y-6 bg-white">
         <div className="space-y-4">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Assigned Team ({event.assignments.length})</h3>
            <div className="space-y-3">
               {event.assignments.map((a: any, i: number) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Avatar className="w-8 h-8 rounded-lg shadow-sm">
                          <AvatarFallback className="text-[10px] font-black bg-[#2A7EC8] text-white">
                             {a.member_name.charAt(0)}
                          </AvatarFallback>
                       </Avatar>
                       <div>
                          <div className="text-xs font-bold">{a.member_name}</div>
                          <div className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{a.role}</div>
                       </div>
                    </div>
                    {a.is_confirmed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Badge variant="outline" className="h-5 text-[8px] font-black uppercase border-amber-100 text-amber-600 bg-amber-50">Pending</Badge>
                    )}
                 </div>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-10 rounded-xl text-xs font-bold border-slate-100 flex-1 hover:bg-slate-50 transition-all font-bold">
               <FileText className="w-3.5 h-3.5 mr-2" /> View Brief
            </Button>
            <Button className="h-10 rounded-xl text-xs font-bold flex-1 bg-slate-900 shadow-lg shadow-slate-200 transition-all active:scale-95 px-3">
               Add Runner <Plus className="w-3 h-3 ml-2" />
            </Button>
         </div>

         <Link 
           href={`/bookings/${event.booking_id || event.id}`}
           className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-primary/5 group transition-all"
         >
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm border border-slate-100 transition-colors">
                  <ArrowRight className="w-4 h-4" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">Full Booking Details</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-primary transition-colors" />
         </Link>
      </div>
    </div>
  );
}
