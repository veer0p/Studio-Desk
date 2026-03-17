"use client";

import { useState } from "react";
import { ArrowLeft, Save, Globe, Eye, Settings, HelpCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ContractEditor } from "@/components/contracts/ContractEditor";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function EditContractTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  
  const [name, setName] = useState(isNew ? "" : "Wedding Services Agreement");
  const [eventType, setEventType] = useState(isNew ? "wedding" : "wedding");
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(`
    <h1>Photography Services Agreement</h1>
    <p>This agreement is made between <strong>{{studio_name}}</strong> (the "Studio") and <strong>{{client_name}}</strong> (the "Client") for photography services on <strong>{{event_date}}</strong>.</p>
    
    <h2>1. Event Summary</h2>
    <p>The event is a <strong>{{event_type}}</strong> taking place at <strong>{{venue_name}}</strong>. The Studio will provide coverage as specified in the accepted proposal.</p>
    
    <h2>2. Payment Terms</h2>
    <p>The total investment for this project is <strong>{{total_amount}}</strong>. A non-refundable advance of <strong>{{advance_amount}}</strong> is required to secure the date. The remaining balance of <strong>{{balance_amount}}</strong> is due on the day of the event.</p>
    
    <h2>3. Deliverables</h2>
    <p>Studio will deliver high-resolution edited images within 30 days of the event via a digital gallery.</p>
  `);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    setIsSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Template saved successfully");
      router.push("/settings/contract-templates");
    } catch (error) {
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full shadow-sm" asChild>
            <Link href="/settings/contract-templates">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="space-y-1">
             <div className="flex items-center gap-3">
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Template Name (e.g. Wedding Contract)" 
                  className="text-2xl font-bold bg-transparent border-transparent hover:border-slate-100 focus:border-primary h-auto p-0 px-2 w-full max-w-md transition-all shadow-none"
                />
             </div>
             <div className="flex items-center gap-4 text-xs">
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger className="h-6 w-28 bg-slate-50 border-none font-bold uppercase tracking-widest text-[9px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="wedding">Wedding</SelectItem>
                     <SelectItem value="pre_wedding">Pre-Wedding</SelectItem>
                     <SelectItem value="event">Commercial</SelectItem>
                     <SelectItem value="other">Generic</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                   <Switch id="default-toggle" checked={isDefault} onCheckedChange={setIsDefault} />
                   <Label htmlFor="default-toggle" className="text-[10px] font-black uppercase text-slate-400">Set as default</Label>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="ghost" size="sm" className="hidden md:flex text-slate-400 hover:text-slate-900 font-bold">
              <Eye className="w-4 h-4 mr-2" /> Full Preview
           </Button>
           <Button 
             className="bg-primary shadow-xl shadow-primary/20 h-11 px-8 rounded-xl font-bold"
             onClick={handleSave}
             disabled={isSaving}
           >
             {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Template</>}
           </Button>
        </div>
      </div>

      <ContractEditor 
        initialContent={content} 
        onChange={setContent} 
      />

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-full px-8 py-4 flex items-center gap-8 shadow-2xl z-50 animate-in slide-in-from-bottom-8">
         <div className="flex items-center gap-3 pr-8 border-r border-slate-700">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-primary">
               <HelpCircle className="w-4 h-4" />
            </div>
            <div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pro Tip</div>
               <p className="text-xs font-bold">Use <code className="bg-slate-800 px-1 rounded text-primary">{"{{"}variable_name{"}}"}</code> to insert dynamic profile data.</p>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex flex-col">
               <span className="text-[9px] font-black uppercase text-slate-500">Auto-save Status</span>
               <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Cloud Sync Active
               </span>
            </div>
         </div>
      </div>
    </div>
  );
}
