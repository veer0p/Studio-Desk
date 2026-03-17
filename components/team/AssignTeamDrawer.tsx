"use client";

import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert,
  Loader2,
  CalendarDays
} from "lucide-react";
import { toast } from "sonner";
import { formatIndianDate } from "@/lib/formatters";

interface AssignTeamDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
  onSuccess: () => void;
}

export function AssignTeamDrawer({ open, onOpenChange, booking, onSuccess }: AssignTeamDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");
  const [role, setRole] = useState("");
  const [callTime, setCallTime] = useState("10:00");
  const [dayRate, setDayRate] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmConflict, setConfirmConflict] = useState(false);

  // Mock members with conflicts
  const team = [
    { id: "1", name: "Viraj Patel", role: "Owner", spec: "Wedding", hasConflict: true, conflictTitle: "Malhotra Engagement" },
    { id: "2", name: "Sneha Rao", role: "Photographer", spec: "Portrait", hasConflict: false },
    { id: "3", name: "Rahul Mehra", role: "Videographer", spec: "Cinematic", hasConflict: false },
  ];

  const selectedMemberData = team.find(m => m.id === selectedMember);

  const handleAssign = async () => {
    if (!selectedMember || !role) return;
    setIsLoading(true);
    try {
      // Mock API
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${selectedMemberData?.name} assigned to shoot`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to assign member");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md rounded-l-3xl p-8 space-y-10 overflow-y-auto border-none shadow-2xl">
        <SheetHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner">
             <Users className="w-6 h-6" />
          </div>
          <SheetTitle className="text-2xl font-black tracking-tight">Assign Crew</SheetTitle>
          <SheetDescription className="text-slate-500 font-medium">
            Select a team member for <span className="text-slate-900 font-bold">{booking.title}</span> on {formatIndianDate(booking.event_date)}.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Team Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                 <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-primary transition-all pr-4">
                    <SelectValue placeholder="Identify member..." />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl p-1 border-slate-100 shadow-2xl">
                    {team.map(m => (
                      <SelectItem key={m.id} value={m.id} className="rounded-xl p-3 focus:bg-slate-50">
                         <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 rounded-lg">
                               <AvatarFallback className="bg-[#2A7EC8] text-white text-[10px] font-black">
                                  {m.name.charAt(0)}
                               </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                               <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  {m.name} {m.hasConflict && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                               </div>
                               <div className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{m.role} • {m.spec}</div>
                            </div>
                         </div>
                      </SelectItem>
                    ))}
                 </SelectContent>
              </Select>
           </div>

           {selectedMemberData?.hasConflict && (
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] space-y-4 animate-in zoom-in-95 duration-300">
                 <div className="flex gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                       <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-sm font-bold text-amber-800">Assign anyway?</h4>
                       <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-tight mt-1">
                          {selectedMemberData.name} is already assigned to <span className="text-amber-800 underline">&quot;{selectedMemberData.conflictTitle}&quot;</span> on this date.
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <Checkbox id="conflict" checked={confirmConflict} onCheckedChange={(v: any) => setConfirmConflict(v)} className="rounded-md border-amber-200" />
                    <Label htmlFor="conflict" className="text-[10px] font-black uppercase tracking-widest text-amber-600 cursor-pointer">I understand the conflict</Label>
                 </div>
              </div>
           )}

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Position</Label>
                 <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50">
                       <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                       <SelectItem value="lead" className="text-xs font-bold">Lead Shooter</SelectItem>
                       <SelectItem value="second" className="text-xs font-bold">2nd Shooter</SelectItem>
                       <SelectItem value="assistant" className="text-xs font-bold">Assistant</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Call Time</Label>
                 <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input 
                      type="time" 
                      value={callTime} 
                      onChange={(e) => setCallTime(e.target.value)}
                      className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                    />
                 </div>
              </div>
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Negotiated Day Rate (Optional)</Label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">₹</span>
                 <Input 
                   type="number" 
                   value={dayRate}
                   onChange={(e) => setDayRate(e.target.value)}
                   placeholder="7500" 
                   className="h-14 pl-10 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                 />
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-2 italic">Leave empty to use member&apos;s default Studio rate.</p>
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Venue / Access Notes</Label>
              <Textarea 
                placeholder="Meet at the lobby 10 mins before call time..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-50/50 border-none rounded-2xl p-4 min-h-[100px] text-sm font-medium"
              />
           </div>
        </div>

        <SheetFooter className="pt-4">
           <Button 
             className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black text-lg shadow-2xl transition-all active:scale-95"
             onClick={handleAssign}
             disabled={isLoading || !selectedMember || !role || (selectedMemberData?.hasConflict && !confirmConflict)}
           >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Assign & Notify"}
           </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
