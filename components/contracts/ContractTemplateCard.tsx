"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FileText, Layout, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractTemplateCardProps {
  template: {
    id: string;
    name: string;
    event_type: string;
    description?: string;
    usage_count: number;
    is_default: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
}

export function ContractTemplateCard({ template, isSelected, onSelect }: ContractTemplateCardProps) {
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 cursor-pointer border-2",
        isSelected 
          ? "border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20" 
          : "border-slate-100 hover:border-slate-300 hover:shadow-md"
      )}
      onClick={onSelect}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
           <div className={cn(
             "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
             isSelected ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
           )}>
              <FileText className="w-6 h-6" />
           </div>
           {template.is_default && (
             <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none font-black text-[10px] uppercase tracking-widest">
               Default
             </Badge>
           )}
        </div>

        <div>
           <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{template.name}</h3>
           <Badge variant="outline" className="mt-1 text-[10px] uppercase font-bold text-slate-400 border-slate-200">
             {template.event_type}
           </Badge>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8">
           {template.description || "A standard photography agreement template covering all essential clauses."}
        </p>

        <div className="flex items-center gap-2 pt-2">
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
             <Layout className="w-3 h-3" /> Used {template.usage_count} times
           </div>
        </div>
      </CardContent>

      <CardFooter className={cn(
        "p-4 border-t bg-slate-50/50 flex justify-end",
        isSelected && "bg-primary/5 border-t-primary/10"
      )}>
        {isSelected ? (
          <div className="text-primary flex items-center gap-2 text-sm font-black uppercase tracking-tighter">
             Selected <Check className="w-4 h-4" />
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-slate-400 group-hover:text-slate-900">
            Use Template <ArrowRight className="w-3 h-3 ml-2" />
          </Button>
        )}
      </CardFooter>
      
      {isSelected && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -mr-12 -mt-12 rounded-full blur-2xl" />
      )}
    </Card>
  );
}
