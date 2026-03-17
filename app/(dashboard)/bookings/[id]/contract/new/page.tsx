"use client";

import { useState } from "react";
import { ArrowLeft, Save, Send, Eye, Search, Layers, ChevronRight, FileCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContractEditor } from "@/components/contracts/ContractEditor";
import { ContractTemplateCard } from "@/components/contracts/ContractTemplateCard";

async function getContractTemplates() {
  return [
    { id: "T1", name: "Wedding Services Agreement", event_type: "wedding", usage_count: 142, is_default: true },
    { id: "T2", name: "Engagement Shoot", event_type: "pre_wedding", usage_count: 85, is_default: false },
  ];
}

export default function NewContractPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Mock booking data
  const booking = { id: params.id, title: "Siddharth & Ananya Wedding" };
  const templates = [
    { id: "T1", name: "Wedding Services Agreement", event_type: "wedding", usage_count: 142, is_default: true, description: "Standard wedding photography agreement with copyright and deliverables clauses." },
    { id: "T2", name: "Engagement / Couple Shoot", event_type: "pre_wedding", usage_count: 85, is_default: false, description: "Simplified agreement for short sessions and portraits." },
  ];

  const handleCreate = async () => {
    if (!content) {
      toast.error("Please add contract content or select a template");
      return;
    }

    setIsSaving(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Contract created and sent for signature!");
      router.push(`/bookings/${params.id}`);
    } catch (error) {
      toast.error("Failed to create contract");
    } finally {
      setIsSaving(false);
    }
  };

  const selectTemplate = (t: any) => {
    setSelectedTemplate(t.id);
    // Mock template content load
    setContent(`
      <h1>Photography Services Agreement</h1>
      <p>This agreement is made between <strong>{{studio_name}}</strong> and <strong>{{client_name}}</strong>.</p>
      <p>The event is a <strong>{{event_type}}</strong> taking place on <strong>{{event_date}}</strong>.</p>
      <h2>Terms & Conditions</h2>
      <p>1. Payments: The total amount of <strong>{{total_amount}}</strong> is payable as follows...</p>
    `);
    toast.info(`Loaded "${t.name}" template`);
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full shadow-sm" asChild>
            <Link href={`/bookings/${params.id}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
             <h1 className="text-3xl font-bold tracking-tight">Generate Contract</h1>
             <p className="text-sm text-muted-foreground mt-1">
               Creating agreement for <span className="font-black text-slate-900">{booking.title}</span>
             </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Button variant="ghost" className="font-bold text-slate-400 hover:text-slate-900">
             Save as Draft
           </Button>
           <Button 
             className="bg-primary shadow-xl shadow-primary/20 h-11 px-8 rounded-xl font-bold"
             onClick={handleCreate}
             disabled={isSaving || !content}
           >
             {isSaving ? "Creating..." : <><Send className="w-4 h-4 mr-2" /> Send for Signature</>}
           </Button>
        </div>
      </div>

      {!content ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-primary/5 rounded-3xl p-12 text-center max-w-2xl mx-auto border-2 border-dashed border-primary/20">
              <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl mb-6">
                 <Layers className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Choose a Starting Template</h2>
              <p className="text-slate-500 mt-2">Select a legal template to auto-populate the contract editor. You can still customize everything before sending.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {templates.map((t) => (
                <ContractTemplateCard 
                  key={t.id} 
                  template={t} 
                  isSelected={selectedTemplate === t.id} 
                  onSelect={() => selectTemplate(t)} 
                />
              ))}
              <div 
                className="group border-2 border-dashed border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all min-h-[200px]"
                onClick={() => setContent("<h1>Blank Agreement</h1><p>Start typing...</p>")}
              >
                 <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                    <Plus className="w-6 h-6" />
                 </div>
                 <h3 className="font-bold text-slate-400 group-hover:text-primary">Start from Scratch</h3>
              </div>
           </div>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
           <ContractEditor 
             initialContent={content} 
             onChange={setContent} 
           />
        </div>
      )}

      {content && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-2xl z-50">
           <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold px-4" onClick={() => setContent("")}>
              Change Template
           </Button>
           <div className="h-4 w-px bg-slate-200 mx-2" />
           <p className="text-[10px] font-black uppercase text-slate-400 px-4 tracking-widest flex items-center gap-2">
              <FileCheck className="w-3 h-3 text-emerald-500" /> Contract Drafted
           </p>
        </div>
      )}
    </div>
  );
}
