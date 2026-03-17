import { Plus, ListFilter, Search, MoreVertical, Edit2, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ContractTemplateCard } from "@/components/contracts/ContractTemplateCard";

async function getContractTemplates() {
  // Mock templates
  return [
    { 
      id: "T1", 
      name: "Wedding Services Agreement", 
      event_type: "wedding", 
      usage_count: 142, 
      is_default: true,
      description: "Comprehensive contract covering multi-day weddings, deliverables, and copyright terms."
    },
    { 
      id: "T2", 
      name: "Engagement / Couple Shoot", 
      event_type: "pre_wedding", 
      usage_count: 85, 
      is_default: false,
      description: "Short-form agreement focused on pre-wedding and portrait sessions."
    },
    { 
      id: "T3", 
      name: "Commercial Event Contract", 
      event_type: "event", 
      usage_count: 24, 
      is_default: false,
      description: "Business-oriented agreement for corporate events and conferences."
    }
  ];
}

export default async function ContractTemplatesPage() {
  const templates = await getContractTemplates();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contract Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your legal agreements and standard clauses.</p>
        </div>
        <Button asChild className="bg-primary shadow-xl shadow-primary/20 h-11 px-6">
          <Link href="/settings/contract-templates/new">
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search templates..." className="pl-10 h-11 border-slate-200 focus:border-primary transition-all" />
         </div>
         <Button variant="outline" className="h-11 border-slate-200 px-6 font-bold text-slate-600">
            <ListFilter className="w-4 h-4 mr-2" /> Filter
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {templates.map((template) => (
           <div key={template.id} className="relative group">
              <ContractTemplateCard 
                template={template} 
                isSelected={false} 
                onSelect={() => {}} 
              />
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur shadow-sm hover:text-primary" asChild>
                    <Link href={`/settings/contract-templates/${template.id}`}>
                       <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                 </Button>
                 <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 backdrop-blur shadow-sm hover:text-rose-500">
                    <Trash2 className="w-3.5 h-3.5" />
                 </Button>
              </div>
           </div>
         ))}
         
         <Link 
           href="/settings/contract-templates/new"
           className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-3xl group hover:border-primary hover:bg-primary/5 transition-all text-center min-h-[300px]"
         >
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-all">
               <Plus className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-400 group-hover:text-primary transition-colors">Create Brand New Template</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-[180px]">Start with a blank slate or use our photography boilerplate.</p>
         </Link>
      </div>
    </div>
  );
}
