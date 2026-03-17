"use client";

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  UserMinus, 
  Power,
  Calendar as CalendarIcon,
  Tent
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StudioMember, Assignment } from "@/types";
import { useState } from "react";
import { TeamMemberDetailDrawer } from "./TeamMemberDetailDrawer";

interface TeamMemberCardProps {
  member: StudioMember;
  upcomingAssignment?: any;
}

const roleColors: Record<string, string> = {
  owner: "bg-[#1A3C5E] text-white hover:bg-[#1A3C5E]",
  photographer: "bg-[#2A7EC8] text-white hover:bg-[#2A7EC8]",
  videographer: "bg-[#16A085] text-white hover:bg-[#16A085]",
  editor: "bg-purple-600 text-white hover:bg-purple-600",
  assistant: "bg-slate-400 text-white hover:bg-slate-400",
};

export function TeamMemberCard({ member, upcomingAssignment }: TeamMemberCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const initials = member.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      <Card 
        className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer"
        onClick={() => setIsDetailOpen(true)}
      >
        <CardContent className="p-8">
           <div className="flex justify-between items-start mb-6">
              <div className="relative">
                 <Avatar className="w-16 h-16 rounded-[2rem] shadow-lg border-2 border-white group-hover:scale-105 transition-transform duration-500">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className={cn("text-xl font-black text-white", member.role === 'owner' ? 'bg-[#1A3C5E]' : 'bg-[#2A7EC8]')}>
                       {initials}
                    </AvatarFallback>
                 </Avatar>
                 <div className={cn(
                   "absolute bottom-1 right-1 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                   member.is_active ? "bg-emerald-500" : "bg-slate-300"
                 )} />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl border border-slate-50 shadow-sm bg-white hover:bg-slate-50 transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-slate-100">
                   <DropdownMenuItem className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest gap-2" onClick={() => setIsDetailOpen(true)}>
                      <Eye className="w-4 h-4 text-slate-400" /> View Profile
                   </DropdownMenuItem>
                   <DropdownMenuItem className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest gap-2">
                      <Edit2 className="w-4 h-4 text-primary" /> Edit Details
                   </DropdownMenuItem>
                   <DropdownMenuSeparator className="my-1" />
                   <DropdownMenuItem className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest gap-2 text-rose-500 focus:text-rose-500">
                      <Power className="w-4 h-4" /> Deactivate
                   </DropdownMenuItem>
                   <DropdownMenuItem className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest gap-2 text-rose-600 focus:text-rose-600">
                      <UserMinus className="w-4 h-4" /> Remove Team
                   </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
           </div>

           <div className="space-y-4">
              <div className="space-y-1">
                 <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{member.display_name}</h3>
                 <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 border-none shadow-sm", roleColors[member.role] || roleColors.assistant)}>
                    {member.role}
                 </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5">
                 {member.specializations.map((spec) => (
                   <span key={spec} className="px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-500 rounded-md uppercase tracking-tighter">
                      {spec}
                   </span>
                 ))}
              </div>

              <div className="pt-4 border-t border-slate-50 mt-4">
                 <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-900 transition-colors">
                    <CalendarIcon className="w-4 h-4" />
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Next Shoot</p>
                       <p className="text-xs font-bold truncate max-w-[180px]">
                         {upcomingAssignment ? `${upcomingAssignment.date} • ${upcomingAssignment.title}` : 'No upcoming shoots'}
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      <TeamMemberDetailDrawer 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
        member={member} 
      />
    </>
  );
}
