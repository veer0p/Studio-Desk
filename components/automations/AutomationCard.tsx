"use client";

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowRight, 
  MessageSquare, 
  Mail, 
  Clock, 
  Zap,
  MoreVertical,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface AutomationCardProps {
  automation: {
    id: string;
    title: string;
    description: string;
    trigger: string;
    channels: string[];
    status: 'active' | 'inactive' | 'draft';
  }
}

export function AutomationCard({ automation }: AutomationCardProps) {
  const [isActive, setIsActive] = useState(automation.status === 'active');

  const handleToggle = (val: boolean) => {
    setIsActive(val);
    toast.success(`${automation.title} is now ${val ? 'Active' : 'Paused'}`);
  };

  return (
    <Card className={cn(
      "border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl transition-all duration-500",
      !isActive && "opacity-80"
    )}>
      <CardContent className="p-8 space-y-6">
         <div className="flex justify-between items-start">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-all duration-500 group-hover:scale-110",
              isActive ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
            )}>
               <Zap className="w-6 h-6" />
            </div>
            <Switch 
              checked={isActive} 
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-emerald-500"
            />
         </div>

         <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{automation.title}</h3>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2">
               {automation.description}
            </p>
         </div>

         <div className="flex flex-wrap gap-2 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
               <Clock className="w-3 h-3 text-slate-400" />
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">{automation.trigger}</span>
            </div>
            <div className="flex items-center gap-1.5">
               {automation.channels.includes('whatsapp') && (
                 <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <MessageSquare className="w-3.5 h-3.5" />
                 </div>
               )}
               {automation.channels.includes('email') && (
                 <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <Mail className="w-3.5 h-3.5" />
                 </div>
               )}
            </div>
         </div>

         <div className="pt-6 border-t border-slate-50">
            <Button 
              variant="ghost" 
              className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary hover:bg-primary/5 transition-all group-hover:bg-slate-50"
              asChild
            >
               <Link href={`/automations/${automation.id}`}>
                  Configure <Settings2 className="w-3.5 h-3.5 ml-2 transition-transform group-hover:rotate-45" />
               </Link>
            </Button>
         </div>
      </CardContent>
    </Card>
  );
}
