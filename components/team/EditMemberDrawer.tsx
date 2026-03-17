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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { StudioMember } from "@/types";
import { toast } from "sonner";
import { Loader2, Edit3, ShieldAlert } from "lucide-react";

interface EditMemberDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: StudioMember;
  onSuccess: () => void;
}

export function EditMemberDrawer({ open, onOpenChange, member, onSuccess }: EditMemberDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(member.display_name);
  const [role, setRole] = useState(member.role);
  const [phone, setPhone] = useState(member.phone || "");
  const [whatsapp, setWhatsapp] = useState(member.whatsapp || "");

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Team member updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update member");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md rounded-l-3xl p-8 space-y-10 overflow-y-auto border-none shadow-2xl">
        <SheetHeader>
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 shadow-inner">
             <Edit3 className="w-6 h-6" />
          </div>
          <SheetTitle className="text-2xl font-black tracking-tight">Edit Team Member</SheetTitle>
          <SheetDescription className="text-slate-500 font-medium whitespace-pre-wrap">
            Update roles, contact info, and specialized tags for <span className="text-slate-900 font-bold">{member.display_name}</span>.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Display Name</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-primary transition-all font-bold"
              />
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Studio Role</Label>
              {member.role === 'owner' ? (
                <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 border border-slate-100">
                   <ShieldAlert className="w-5 h-5 text-slate-400 shrink-0" />
                   <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed">
                     Owner role is managed in Workspace Settings. Roles like Photographer or Assistant can be edited here.
                   </div>
                </div>
              ) : (
                <Select value={role} onValueChange={setRole as any}>
                  <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:border-primary transition-all font-bold text-xs uppercase tracking-widest">
                      <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-1 border-slate-100 shadow-2xl">
                      <SelectItem value="photographer" className="rounded-xl h-12 font-bold text-xs uppercase tracking-widest">Photographer</SelectItem>
                      <SelectItem value="videographer" className="rounded-xl h-12 font-bold text-xs uppercase tracking-widest">Videographer</SelectItem>
                      <SelectItem value="editor" className="rounded-xl h-12 font-bold text-xs uppercase tracking-widest">Editor</SelectItem>
                      <SelectItem value="assistant" className="rounded-xl h-12 font-bold text-xs uppercase tracking-widest">Assistant</SelectItem>
                  </SelectContent>
                </Select>
              )}
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone</Label>
                 <Input 
                   value={phone}
                   onChange={(e) => setPhone(e.target.value)}
                   placeholder="91 9900..." 
                   className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-mono text-sm"
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase tracking-widest text-slate-400">WhatsApp</Label>
                 <Input 
                   value={whatsapp}
                   onChange={(e) => setWhatsapp(e.target.value)}
                   className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-mono text-sm"
                 />
              </div>
           </div>
        </div>

        <SheetFooter className="pt-4 flex flex-col gap-3">
           <Button 
             className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black shadow-2xl transition-all active:scale-95"
             onClick={handleUpdate}
             disabled={isLoading}
           >
              {isLoading ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Updating...</> : "Save Changes"}
           </Button>
           <Button variant="ghost" className="w-full h-12 rounded-2xl font-bold text-slate-400" onClick={() => onOpenChange(false)}>
              Discard
           </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
