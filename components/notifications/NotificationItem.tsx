"use client";

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  FileText, 
  CreditCard, 
  Calendar, 
  Users, 
  Settings, 
  Trash2,
  Circle,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    time: string;
    read: boolean;
    error?: boolean;
  };
  onDelete: () => void;
  onMarkRead: () => void;
}

const typeConfig: Record<string, { icon: any, color: string, bgColor: string }> = {
  lead: { icon: UserPlus, color: "text-blue-500", bgColor: "bg-blue-50" },
  contract: { icon: FileText, color: "text-amber-500", bgColor: "bg-amber-50" },
  payment: { icon: CreditCard, color: "text-emerald-500", bgColor: "bg-emerald-50" },
  booking: { icon: Calendar, color: "text-primary", bgColor: "bg-primary/5" },
  team: { icon: Users, color: "text-purple-500", bgColor: "bg-purple-50" },
  system: { icon: Settings, color: "text-slate-500", bgColor: "bg-slate-50" },
};

export function NotificationItem({ notification, onDelete, onMarkRead }: NotificationItemProps) {
  const config = typeConfig[notification.type] || typeConfig.system;
  const Icon = notification.error ? AlertTriangle : config.icon;

  return (
    <Card 
      className={cn(
        "border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden transition-all group",
        !notification.read ? "bg-white ring-1 ring-primary/10 shadow-primary/5" : "bg-slate-50/50 opacity-80"
      )}
      onClick={() => !notification.read && onMarkRead()}
    >
      <CardContent className="p-6 flex items-start gap-6">
         <div className={cn(
           "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0",
           notification.error ? "bg-rose-500 text-white" : `${config.bgColor} ${config.color}`
         )}>
            <Icon className="w-6 h-6" />
         </div>

         <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
               <h3 className={cn("text-sm font-black transition-colors", !notification.read ? "text-slate-900" : "text-slate-500")}>
                  {notification.title}
               </h3>
               <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{notification.time}</span>
            </div>
            <p className={cn("text-xs leading-relaxed font-medium", !notification.read ? "text-slate-600" : "text-slate-400")}>
               {notification.message}
            </p>
         </div>

         <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notification.read && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-lg text-primary hover:bg-primary/5"
                onClick={(e) => { e.stopPropagation(); onMarkRead(); }}
              >
                <Circle className="w-3 h-3 fill-current" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-50"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
               <Trash2 className="w-4 h-4" />
            </Button>
         </div>
      </CardContent>
    </Card>
  );
}
