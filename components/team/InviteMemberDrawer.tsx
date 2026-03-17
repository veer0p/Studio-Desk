"use client";

import { useState } from "react";
import { Plus, Mail, ShieldCheck, UserPlus, Loader2 } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export function InviteMemberDrawer() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("photographer");
  const [message, setMessage] = useState("");

  const handleInvite = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Invitation sent to ${email}`);
      setOpen(false);
      setEmail("");
      setRole("photographer");
      setMessage("");
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-primary shadow-xl shadow-primary/20 h-11 px-6 rounded-xl font-bold">
           <Plus className="w-4 h-4 mr-2" /> Invite Member
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md rounded-l-3xl p-8 space-y-10 overflow-y-auto border-none shadow-2xl">
        <SheetHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner">
             <UserPlus className="w-6 h-6" />
          </div>
          <SheetTitle className="text-2xl font-black tracking-tight">Invite Team Member</SheetTitle>
          <SheetDescription className="text-slate-500 font-medium leading-relaxed">
            Expand your studio&apos;s bandwidth. New members will receive an email to join your workspace.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</Label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                 <Input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="nikhil@example.com" 
                   className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-primary transition-all font-bold"
                 />
              </div>
           </div>

           <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Team Role</Label>
                 <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest py-0.5 px-1.5 border-slate-200 text-slate-400">Permissions Required</Badge>
              </div>
              <Select value={role} onValueChange={setRole}>
                 <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-primary transition-all font-bold">
                    <SelectValue placeholder="Select role" />
                 </SelectTrigger>
                 <SelectContent className="rounded-2xl p-1 border-slate-100 shadow-2xl">
                    <SelectItem value="photographer" className="rounded-xl h-12 font-bold text-xs uppercase tracking-widest">Photographer</SelectItem>
                    <SelectItem value="videographer" className="rounded-xl h-12 font-bold text-xs uppercase tracking-widest">Videographer</SelectItem>
                    <SelectItem value="editor" className="rounded-xl h-12 font-bold text-xs uppercase tracking-widest">Editor</SelectItem>
                    <SelectItem value="assistant" className="rounded-xl h-12 font-bold text-xs uppercase tracking-widest">Assistant / Intern</SelectItem>
                 </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-400 font-medium px-1 italic">
                Note: Owner role can only be transferred in Settings.
              </p>
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Message (Optional)</Label>
              <Textarea 
                placeholder="Hey! Join our studio team on StudioDesk to manage your shoots and payments."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-slate-50/50 border-none rounded-2xl p-4 min-h-[120px] focus:bg-white transition-all text-sm font-medium"
              />
           </div>
        </div>

        <SheetFooter className="pt-4">
           <Button 
             className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95"
             onClick={handleInvite}
             disabled={isLoading || !email}
           >
              {isLoading ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Sending...</> : <><Plus className="w-5 h-5 mr-3" /> Send Invitation</>}
           </Button>
        </SheetFooter>

        <div className="pt-8 flex items-center justify-center gap-2 opacity-30">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-[9px] font-black uppercase tracking-widest">Invite valid for 7 days</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
