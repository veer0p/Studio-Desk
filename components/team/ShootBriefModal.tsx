"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  LayoutList, 
  Users, 
  Printer, 
  Save, 
  Eye, 
  AlertCircle,
  Clock,
  MapPin,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ShootBriefModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: any;
}

export function ShootBriefModal({ open, onOpenChange, booking }: ShootBriefModalProps) {
  const [brief, setBrief] = useState(booking.brief || "Event flow:\n10:00 - Groom getting ready\n11:30 - First look in courtyard\n13:00 - Ceremony starts");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    toast.success("Shoot brief saved & team notified");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh]">
        <div className="bg-slate-900 p-10 text-white">
           <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                    <FileText className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black tracking-tight">Shoot Briefing</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{booking.title}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white" onClick={() => window.print()}>
                    <Printer className="w-5 h-5" />
                 </Button>
              </div>
           </div>

           <div className="flex gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5" /> 15 Mar 2025</div>
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {booking.venue_city || "Mumbai"}</div>
              <div className="flex items-center gap-2 font-black text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> 3 Members Assigned</div>
           </div>
        </div>

        <div className="p-0">
           <Tabs defaultValue="edit" className="w-full">
              <div className="px-10 border-b border-slate-50 bg-slate-50/50">
                 <TabsList className="bg-transparent h-14 p-0">
                    <TabsTrigger value="edit" className="h-14 bg-transparent border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent rounded-none px-6 font-bold text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 transition-all">
                       <LayoutList className="w-4 h-4 mr-2" /> Content Editor
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="h-14 bg-transparent border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent rounded-none px-6 font-bold text-[10px] uppercase tracking-widest text-slate-400 data-[state=active]:text-slate-900 transition-all">
                       <Eye className="w-4 h-4 mr-2" /> Team Preview
                    </TabsTrigger>
                 </TabsList>
              </div>

              <div className="p-10 min-h-[400px]">
                 <TabsContent value="edit" className="m-0 space-y-8 animate-in fade-in duration-300">
                    <div className="bg-amber-50 rounded-2xl p-4 flex gap-4 border border-amber-100">
                       <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                       <p className="text-[10px] font-black uppercase text-amber-800 leading-relaxed tracking-tight">
                         Changes to the brief are immediately visible to all assigned team members via their dashboards and public brief links.
                       </p>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Event Flow & Key Shots</label>
                          <Badge variant="outline" className="text-[8px] font-black uppercase border-slate-200">Markdown Supported</Badge>
                       </div>
                       <Textarea 
                         value={brief}
                         onChange={(e) => setBrief(e.target.value)}
                         className="min-h-[300px] border-none bg-slate-50/50 p-6 rounded-2xl font-mono text-sm leading-relaxed focus:bg-white transition-all shadow-inner"
                       />
                    </div>

                    <div className="flex justify-between items-center pt-4">
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Last synced 2m ago</p>
                       <Button className="h-12 px-8 rounded-xl font-black bg-slate-900 shadow-xl shadow-slate-200" onClick={handleSave} disabled={isSaving}>
                          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                          Update Brief
                       </Button>
                    </div>
                 </TabsContent>

                 <TabsContent value="preview" className="m-0 animate-in zoom-in-95 duration-300">
                    <div className="max-w-2xl mx-auto space-y-10 py-6">
                       <div className="prose prose-slate max-w-none whitespace-pre-wrap font-medium text-slate-600 border-l-4 border-slate-100 pl-8 text-lg">
                          {brief}
                       </div>
                       
                       <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-50">
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Assigned Crew</h4>
                             <div className="flex -space-x-3 overflow-hidden">
                                <Users className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 p-2" />
                             </div>
                          </div>
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Merchant Contact</h4>
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                   <Users className="w-5 h-5" />
                                </div>
                                <div className="text-xs font-bold text-slate-900">+91 98000 00000</div>
                             </div>
                          </div>
                       </div>
                    </div>
                 </TabsContent>
              </div>
           </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
