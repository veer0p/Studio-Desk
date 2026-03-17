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
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarOff, 
  ShieldAlert, 
  Clock, 
  Check, 
  Loader2,
  Calendar as CalendarIcon
} from "lucide-react";
import { toast } from "sonner";
import { formatIndianDate } from "@/lib/formatters";

interface UnavailabilityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  onSaved: () => void;
}

export function UnavailabilityForm({ open, onOpenChange, memberId, memberName, onSaved }: UnavailabilityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [allDay, setAllDay] = useState(true);
  const [reason, setReason] = useState("");

  const handleSave = async () => {
    if (!date) return;
    setIsLoading(true);
    try {
      // Mock API
      await new Promise(r => setTimeout(r, 1200));
      toast.success(`${memberName} marked unavailable for ${formatIndianDate(date.toISOString())}`);
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to update availability");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md rounded-l-3xl p-8 space-y-10 overflow-y-auto border-none shadow-2xl">
        <SheetHeader>
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 shadow-inner">
             <CalendarOff className="w-6 h-6" />
          </div>
          <SheetTitle className="text-2xl font-black tracking-tight">Block Schedule</SheetTitle>
          <SheetDescription className="text-slate-500 font-medium">
            Mark <span className="text-slate-900 font-bold">{memberName}</span> as unavailable for shoots on a specific date.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-8">
           <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Select Date</Label>
              <div className="p-4 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <Calendar 
                   mode="single" 
                   selected={date} 
                   onSelect={setDate} 
                   className="p-0 border-none mx-auto"
                   disabled={{ before: new Date() }}
                 />
              </div>
           </div>

           <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                 <h4 className="text-xs font-bold text-slate-900">All Day Event</h4>
                 <p className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">Block entire 24 hour slot</p>
              </div>
              <Switch checked={allDay} onCheckedChange={setAllDay} className="data-[state=checked]:bg-rose-500" />
           </div>

           {!allDay && (
             <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">From</Label>
                   <Input type="time" className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Till</Label>
                   <Input type="time" className="h-12 rounded-xl bg-slate-50 border-none font-bold" />
                </div>
             </div>
           )}

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Reason (Optional)</Label>
              <Textarea 
                placeholder="Personal leave, travel, gear maintenance..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-50/50 border-none rounded-2xl p-4 min-h-[100px] text-sm font-medium"
              />
           </div>

           <div className="bg-amber-50 rounded-2xl p-4 flex gap-4 border border-amber-100">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                Blocking dates does not cancel existing confirmed assignments. Please reassign active shoots first.
              </p>
           </div>
        </div>

        <SheetFooter className="pt-4">
           <Button 
             className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black text-lg shadow-2xl transition-all active:scale-95"
             onClick={handleSave}
             disabled={isLoading || !date}
           >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Check className="w-5 h-5 mr-3" />}
              Save Block
           </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
