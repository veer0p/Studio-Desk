"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { AssignmentDetailPopover } from "./AssignmentDetailPopover";
import { AlertCircle, Clock } from "lucide-react";

interface CalendarEventProps {
  event: {
    id: string;
    title: string;
    event_type: string;
    event_date: string;
    call_time: string;
    venue_city: string;
    assignments: any[];
  }
}

const typeStyles: Record<string, string> = {
  wedding: "border-rose-200 bg-rose-50/50 text-rose-700",
  corporate: "border-blue-200 bg-blue-50/50 text-blue-700",
  pre_wedding: "border-amber-200 bg-amber-50/50 text-amber-700",
  birthday: "border-purple-200 bg-purple-50/50 text-purple-700",
  other: "border-slate-200 bg-slate-50/50 text-slate-700",
};

const typeIndicators: Record<string, string> = {
  wedding: "bg-rose-500",
  corporate: "bg-blue-500",
  pre_wedding: "bg-amber-500",
  birthday: "bg-purple-500",
  other: "bg-slate-500",
};

export function CalendarEvent({ event }: CalendarEventProps) {
  const hasUnconfirmed = event.assignments.some(a => !a.is_confirmed);
  const style = typeStyles[event.event_type] || typeStyles.other;
  const dot = typeIndicators[event.event_type] || typeIndicators.other;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className={cn(
          "px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer hover:shadow-md transition-all truncate group flex items-center justify-between",
          style
        )}>
           <div className="flex items-center gap-2 truncate">
              <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 shadow-sm", dot)} />
              <span className="truncate">{event.title}</span>
           </div>
           
           <div className="flex items-center gap-1 shrink-0 ml-1">
              {hasUnconfirmed && <AlertCircle className="w-2.5 h-2.5 text-amber-500 animate-pulse" />}
              <span className="text-[8px] opacity-60 font-black">{event.call_time.split(' ')[0]}</span>
           </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-none shadow-2xl rounded-3xl overflow-hidden" align="start">
         <AssignmentDetailPopover event={event} />
      </PopoverContent>
    </Popover>
  );
}
