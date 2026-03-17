"use client";

import { 
  Bell, 
  Circle, 
  ExternalLink, 
  CheckCheck,
  BellOff
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mockNotifications = [
  { id: "n1", title: "New Inquiry Received", time: "2m ago", read: false },
  { id: "n2", title: "Contract Signed", time: "1h ago", read: false },
  { id: "n3", title: "Payment Successful", time: "5h ago", read: true },
];

export function NotificationBell() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white font-black animate-in zoom-in duration-300">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 rounded-3xl border-slate-100 shadow-2xl mr-4 overflow-hidden" align="end">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notifications</h3>
           <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase px-2 h-5">{unreadCount} New</Badge>
        </div>
        
        <ScrollArea className="h-[300px]">
           <div className="divide-y divide-slate-50">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className={cn(
                    "p-4 flex gap-4 hover:bg-slate-50/50 transition-colors group cursor-pointer",
                    !n.read && "bg-white"
                  )}>
                     <div className={cn(
                       "w-2 h-2 rounded-full mt-2 shrink-0",
                       !n.read ? "bg-primary" : "bg-slate-200"
                     )} />
                     <div className="flex-1 space-y-0.5">
                        <p className={cn("text-xs font-bold leading-tight", !n.read ? "text-slate-900" : "text-slate-500")}>
                           {n.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">{n.time}</p>
                     </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-300">
                   <BellOff className="w-8 h-8 opacity-20" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">No notifications</p>
                </div>
              )}
           </div>
        </ScrollArea>

        <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex gap-2">
           <Button variant="ghost" className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary" asChild>
              <Link href="/notifications">View All</Link>
           </Button>
           <Button variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white text-slate-400 hover:text-emerald-500" onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}>
              <CheckCheck className="w-4 h-4" />
           </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
