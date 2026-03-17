"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  Calendar as CalendarIcon, 
  History, 
  CreditCard,
  ExternalLink,
  MapPin,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Award
} from "lucide-react";
import { StudioMember } from "@/types";
import { formatINR, formatIndianDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface TeamMemberDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: StudioMember;
}

export function TeamMemberDetailDrawer({ open, onOpenChange, member }: TeamMemberDetailDrawerProps) {
  const initials = member.display_name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl rounded-l-[3rem] p-0 overflow-y-auto border-none shadow-2xl">
        <div className="h-40 bg-slate-900 relative">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
           <div className="absolute -bottom-16 left-12">
              <Avatar className="w-32 h-32 rounded-[2.5rem] border-[6px] border-white shadow-2xl">
                 <AvatarImage src={member.avatar_url} />
                 <AvatarFallback className="text-3xl font-black bg-[#2A7EC8] text-white">
                    {initials}
                 </AvatarFallback>
              </Avatar>
           </div>
        </div>

        <div className="pt-20 px-12 space-y-8 pb-12">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="space-y-2">
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">{member.display_name}</h2>
                 <div className="flex items-center gap-3">
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-black px-3 py-1">
                       {member.role}
                    </Badge>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       Available Today
                    </span>
                 </div>
              </div>
              
              <div className="flex gap-2">
                 <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 shadow-sm text-slate-400 hover:text-primary hover:bg-primary/5 transition-all">
                    <Phone className="w-5 h-5" />
                 </Button>
                 <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-slate-100 shadow-sm text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                    <MessageCircle className="w-5 h-5" />
                 </Button>
                 <Button className="h-12 px-6 rounded-2xl font-bold bg-slate-900 shadow-xl shadow-slate-200 transition-all active:scale-95">
                    View Portfolio
                 </Button>
              </div>
           </div>

           <Tabs defaultValue="profile" className="w-full">
              <TabsList className="bg-slate-50 p-1 rounded-2xl h-14 w-full grid grid-cols-4 mb-8">
                 <TabsTrigger value="profile" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Profile</TabsTrigger>
                 <TabsTrigger value="schedule" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Schedule</TabsTrigger>
                 <TabsTrigger value="history" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
                 <TabsTrigger value="payments" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Earnings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specializations</h3>
                       <div className="flex flex-wrap gap-2">
                          {member.specializations.map(s => (
                            <Badge key={s} variant="secondary" className="bg-slate-100 border-none text-[10px] font-bold px-3 py-1 text-slate-600 rounded-lg">
                               {s}
                            </Badge>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Day Rate</h3>
                       <div className="text-2xl font-black text-slate-900 tracking-tighter">
                          {formatINR(member.day_rate || 7500)} <span className="text-xs font-bold text-slate-400 tracking-normal opacity-60">/ Shoot</span>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">About / Bio</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                       {member.bio || "Senior photographer with 5+ years of experience in candid wedding photography and fashion portraits. Expertise in natural lighting and creative composition."}
                    </p>
                 </div>

                 <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Joined</p>
                       <p className="text-sm font-bold text-slate-900">{formatIndianDate(member.joined_at)}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Shoots</p>
                       <p className="text-sm font-bold text-slate-900">42 Completed</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Efficiency</p>
                       <p className="text-sm font-bold text-emerald-600">98% Review</p>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                    <div className="flex justify-between items-center">
                       <h4 className="text-sm font-bold text-slate-900">Availability: March 2025</h4>
                       <Button variant="outline" size="sm" className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200">Mark Offline</Button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                       {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <span key={d} className="text-[10px] font-black text-slate-400">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                       {Array.from({ length: 31 }).map((_, i) => (
                         <div key={i} className={cn(
                           "h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer relative",
                           [12, 18, 25].includes(i+1) ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : 
                           [14, 15].includes(i+1) ? "bg-rose-100 text-rose-600 border border-rose-200" :
                           "bg-white text-slate-900 hover:bg-slate-200 border border-slate-100"
                         )}>
                            {i+1}
                            {[12, 18, 25].includes(i+1) && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center shadow-sm"><div className="w-1.5 h-1.5 bg-primary rounded-full" /></div>}
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <Clock className="w-4 h-4" /> Upcoming Assignments (3)
                    </h3>
                    <div className="space-y-3">
                       {[
                         { date: "18 Mar", title: "Malhotra Family Housewarming", role: "Lead" },
                         { date: "25 Mar", title: "Corporate: Google DevFest", role: "Shooter" },
                       ].map((item, i) => (
                         <div key={i} className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer shadow-sm">
                            <div className="flex gap-4 items-center">
                               <div className="w-10 h-10 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-600 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                  <span className="text-[8px] font-bold uppercase tracking-tighter opacity-60">Mar</span>
                                  <span className="text-sm font-black italic">{item.date.split(' ')[0]}</span>
                               </div>
                               <div>
                                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">Assigned as {item.role}</p>
                               </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-slate-50 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                               <ArrowUpRight className="w-4 h-4" />
                            </Button>
                         </div>
                       ))}
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <TrendingUp className="w-4 h-4 text-primary mb-2" />
                          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Shoots</div>
                          <div className="text-2xl font-black text-slate-900 tracking-tighter">142</div>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <Award className="w-4 h-4 text-amber-500 mb-2" />
                          <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Customer Rating</div>
                          <div className="text-2xl font-black text-slate-900 tracking-tighter">4.9 / 5</div>
                       </div>
                    </div>
                    {/* Simplified past shoots list */}
                    <div className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                       <div className="p-4 bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 grid grid-cols-3">
                          <span>Booking</span>
                          <span>Role</span>
                          <span className="text-right">Earnings</span>
                       </div>
                       {[
                         { title: "Raj & Simran Wedding", role: "Protog", amount: 15000 },
                         { title: "Karan's Birthday", role: "Editor", amount: 5000 },
                       ].map((p, i) => (
                         <div key={i} className="p-4 grid grid-cols-3 border-t border-slate-50 items-center hover:bg-slate-50 transition-colors">
                            <span className="text-xs font-bold text-slate-900 truncate pr-4">{p.title}</span>
                            <Badge variant="outline" className="w-fit text-[8px] font-black uppercase border-slate-200 text-slate-400">{p.role}</Badge>
                            <span className="text-xs font-black text-slate-900 text-right">{formatINR(p.amount)}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="payments" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="space-y-8">
                    <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                       <div className="relative z-10 space-y-6">
                          <div className="flex justify-between items-start">
                             <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Payouts</p>
                                <h3 className="text-4xl font-black tracking-tighter">{formatINR(124500)}</h3>
                             </div>
                             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <CreditCard className="w-6 h-6 text-white" />
                             </div>
                          </div>
                          <div className="flex gap-8 border-t border-white/10 pt-6">
                             <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pending</p>
                                <p className="text-lg font-black text-rose-400 tracking-tighter">{formatINR(15000)}</p>
                             </div>
                             <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Paid this month</p>
                                <p className="text-lg font-black text-emerald-400 tracking-tighter">{formatINR(32000)}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recent Transactions</h3>
                       <div className="space-y-3">
                          {[
                            { title: "Nikhil & Sneha Pre-wedding", amount: 7500, status: "paid" },
                            { title: "Corporate: TechFest 2024", amount: 7500, status: "pending" },
                          ].map((pay, i) => (
                            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between group hover:border-primary/20 transition-all shadow-sm">
                               <div className="space-y-1">
                                  <p className="text-xs font-bold text-slate-900">{pay.title}</p>
                                  <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">Shoot Day Rate</p>
                               </div>
                               <div className="text-right space-y-1.5">
                                  <div className="text-sm font-black text-slate-900">{formatINR(pay.amount)}</div>
                                  <Badge className={cn(
                                    "text-[8px] font-black uppercase tracking-widest border-none px-2",
                                    pay.status === 'paid' ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                                  )}>
                                     {pay.status}
                                  </Badge>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </TabsContent>
           </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
