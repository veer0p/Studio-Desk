"use client";

import { 
  ChevronLeft, 
  Settings, 
  MessageSquare, 
  HelpCircle, 
  Info, 
  Zap, 
  Send,
  Loader2,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function NewWhatsAppTemplatePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("utility");
  const [content, setContent] = useState("Hi {{1}}! Thanks for inquiring with {{2}}. We've received your inquiry for {{3}}. We'll get back to you shortly!");

  const handleSubmit = async () => {
    if (!name || !content) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSubmitting(false);
    toast.success("Template submitted to Meta for review");
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100" asChild>
              <Link href="/automations/templates">
                 <ChevronLeft className="w-5 h-5 text-slate-400" />
              </Link>
           </Button>
           <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Register WhatsApp Template</h1>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Official Meta Cloud API Registration
              </p>
           </div>
        </div>

        <Button className="h-12 px-8 rounded-2xl font-black bg-slate-900 shadow-xl shadow-slate-200 transition-all active:scale-95" onClick={handleSubmit} disabled={isSubmitting}>
           {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Submit for Approval
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         <div className="xl:col-span-7 space-y-10">
            {/* Meta Rules Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 flex gap-6">
               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm shrink-0 border border-blue-50">
                  <Info className="w-7 h-7" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-sm font-black uppercase tracking-widest text-blue-900">Meta Guidelines</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-blue-800/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Use lowercase + underscores only
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-bold text-blue-800/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Variables like {{1}} are mandatory
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-bold text-blue-800/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Approval takes 2h to 24h
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-bold text-blue-800/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Utility category is usually faster
                     </div>
                  </div>
               </div>
            </div>

            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-10 space-y-10">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Template Name (Meta ID)</Label>
                     <Input 
                       placeholder="inquiry_auto_reply_v1" 
                       value={name} 
                       onChange={(e) => setName(e.target.value.toLowerCase().replace(/ /g, '_'))}
                       className="h-14 rounded-2xl border-slate-100 font-mono text-xs font-black uppercase tracking-widest text-slate-500 placeholder:opacity-30 bg-slate-50/50" 
                     />
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</Label>
                     <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-14 rounded-2xl border-slate-100 font-bold">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                           <SelectItem value="utility">Utility (Transactional)</SelectItem>
                           <SelectItem value="marketing">Marketing (Promotional)</SelectItem>
                           <SelectItem value="authentication">Authentication (OTP)</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Content</Label>
                     <Button variant="ghost" className="h-6 px-2 text-[9px] font-black uppercase tracking-widest text-primary gap-1">
                        <HelpCircle className="w-3 h-3" /> Variable Guide
                     </Button>
                  </div>
                  <Textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] rounded-3xl border-slate-100 p-8 font-medium text-sm leading-relaxed bg-slate-50/50 focus:bg-white transition-all shadow-inner"
                    placeholder="Enter message text with variables like {{1}}, {{2}}..."
                  />
                  <div className="flex gap-4">
                     <Badge className="bg-slate-900 border-none text-[8px] font-bold py-1 px-3">Variable 1: Client Name</Badge>
                     <Badge className="bg-slate-900 border-none text-[8px] font-bold py-1 px-3">Variable 2: Studio Name</Badge>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-50 space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Buttons (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all cursor-pointer">
                        Add Quick Reply
                     </div>
                     <div className="p-4 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all cursor-pointer">
                        Add Call to Action (Link)
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         {/* Mobile Preview */}
         <aside className="xl:col-span-5 space-y-6 sticky top-8">
            <div className="flex items-center gap-2">
               <Smartphone className="w-5 h-5 text-slate-400" />
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Handset Preview</h2>
            </div>

            <div className="w-[300px] mx-auto bg-slate-900 rounded-[3rem] p-4 shadow-2xl relative">
               <div className="h-6 w-1/3 bg-slate-800 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-10" />
               <div className="bg-[#e5ddd5] rounded-[2.5rem] h-[550px] overflow-hidden flex flex-col p-4 relative pt-10">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://i.pinimg.com/originals/ab/ab/60/abab60f2467d0cf90089856f6168e983.png')" }} />
                  
                  <div className="relative z-10 space-y-4 flex flex-col items-end">
                     {/* Incoming Message Mockup */}
                     <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[85%] self-start animate-in slide-in-from-left-4 duration-500">
                        <div className="text-[13px] text-[#303030] leading-snug whitespace-pre-wrap">
                           {content.replace(/{{1}}/g, "Aman").replace(/{{2}}/g, "StudioDesk").replace(/{{3}}/g, "Wedding Shoot")}
                        </div>
                        <div className="text-[9px] text-slate-400 text-right mt-1">10:45 AM</div>
                     </div>
                  </div>
               </div>
               <div className="h-1.5 w-1/3 bg-slate-800 rounded-full mx-auto mt-4" />
            </div>

            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex gap-4">
               <Zap className="w-6 h-6 text-amber-500 shrink-0" />
               <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic">
                  Preview simulates how a client sees the message. Meta will audit for spam before approving. Avoid using too many exclamation marks or excessive promotional language.
               </p>
            </div>
         </aside>
      </div>
    </div>
  );
}
