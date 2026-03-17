"use client";

import { usePortalSession } from "@/lib/portal/session";
import { SessionExpiredScreen } from "@/components/portal/SessionExpiredScreen";
import { 
  HelpCircle, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Users,
  Camera,
  Map,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const suggestedShots = ["First Look", "Rings", "Family Formals", "Cake Cutting", "First Dance"];

export default function PortalQuestionnairePage() {
  const { session, isLoading, isValid } = usePortalSession();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mustHaveShots, setMustHaveShots] = useState<string[]>(suggestedShots);
  const [newShot, setNewShot] = useState("");
  const [people, setPeople] = useState([{ name: "", relation: "Bride", notes: "" }]);

  if (isLoading) return null;
  if (!isValid) return <SessionExpiredScreen studio={session?.studio} />;

  const handleSubmit = async () => {
    setIsSubmitted(true);
    toast.success("Details updated successfully!");
  };

  if (isSubmitted) {
    return (
      <div className="space-y-10 pb-20 animate-in zoom-in-95">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50" onClick={() => setIsSubmitted(false)}>
               <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Button>
            <div>
               <h1 className="text-xl font-black text-slate-900 tracking-tight">Success!</h1>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Details Received</p>
            </div>
         </div>

         <div className="text-center space-y-8 py-12">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
               <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-3">
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">Event Details Submitted</h2>
               <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                  Thank you! We've received your updates. Our team will review these before the shoot.
               </p>
            </div>
            <div className="pt-6">
               <Button variant="outline" className="h-14 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest" onClick={() => setIsSubmitted(false)}>
                  Update Details Again
               </Button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-32">
      <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50" asChild>
            <Link href="/booking">
               <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Link>
         </Button>
         <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Event Details</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Help us capture it perfectly</p>
         </div>
      </div>

      <div className="space-y-6">
         <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
               <Camera className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Must-Have Shots</h3>
         </div>
         <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap gap-2">
               {mustHaveShots.map(shot => (
                 <Badge key={shot} className="bg-slate-900 text-white border-none py-1.5 px-3 flex gap-2 items-center group">
                    {shot}
                    <button onClick={() => setMustHaveShots(mustHaveShots.filter(s => s !== shot))}>
                       <Plus className="w-3 h-3 rotate-45 opacity-60 group-hover:opacity-100" />
                    </button>
                 </Badge>
               ))}
            </div>
            <div className="flex gap-2">
               <Input 
                 placeholder="Type a custom shot..." 
                 className="h-12 rounded-2xl border-slate-100" 
                 value={newShot}
                 onChange={(e) => setNewShot(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && newShot) {
                     setMustHaveShots([...mustHaveShots, newShot]);
                     setNewShot("");
                   }
                 }}
               />
               <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-200" onClick={() => {
                 if (newShot) {
                   setMustHaveShots([...mustHaveShots, newShot]);
                   setNewShot("");
                 }
               }}>
                  <Plus className="w-5 h-5" />
               </Button>
            </div>
         </div>
      </div>

      <div className="space-y-6">
         <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-inner">
               <Users className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">V.I.P People</h3>
         </div>
         <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            {people.map((p, idx) => (
              <div key={idx} className="space-y-3 relative group">
                 <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Full Name" value={p.name} onChange={(e) => {
                       const next = [...people];
                       next[idx].name = e.target.value;
                       setPeople(next);
                    }} className="h-12 rounded-2xl border-slate-100" />
                    <Input placeholder="Relation" value={p.relation} onChange={(e) => {
                       const next = [...people];
                       next[idx].relation = e.target.value;
                       setPeople(next);
                    }} className="h-12 rounded-2xl border-slate-100" />
                 </div>
                 <Textarea placeholder="Notes" value={p.notes} onChange={(e) => {
                    const next = [...people];
                    next[idx].notes = e.target.value;
                    setPeople(next);
                 }} className="rounded-2xl border-slate-50 min-h-[80px]" />
              </div>
            ))}
            <Button variant="ghost" className="w-full h-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-400 gap-2" onClick={() => setPeople([...people, { name: "", relation: "", notes: "" }])}>
               <Plus className="w-4 h-4" /> Add Person
            </Button>
         </div>
      </div>

      <div className="fixed bottom-24 left-6 right-6 max-w-lg mx-auto z-50">
         <Button className="w-full h-16 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/40 font-black text-sm uppercase tracking-[0.2em]" onClick={handleSubmit}>
            Save All Details
         </Button>
      </div>
    </div>
  );
}
