"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Type, 
  User, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  Briefcase,
  ChevronDown,
  Info,
  Layers,
  Sparkles,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface Variable {
  label: string;
  name: string;
  category: "client" | "event" | "financial" | "studio";
  value?: string;
}

const contractVariables: Variable[] = [
  { label: "Client Name", name: "client_name", category: "client", value: "Priya Sharma" },
  { label: "Client Email", name: "client_email", category: "client", value: "priya@example.com" },
  { label: "Client Phone", name: "client_phone", category: "client", value: "+91 98765 43210" },
  { label: "Event Type", name: "event_type", category: "event", value: "Wedding" },
  { label: "Event Date", name: "event_date", category: "event", value: "June 15, 2024" },
  { label: "Venue Name", name: "venue_name", category: "event", value: "The Leela Palace" },
  { label: "Total Amount", name: "total_amount", category: "financial", value: "₹75,000" },
  { label: "Advance Amount", name: "advance_amount", category: "financial", value: "₹22,500" },
  { label: "Balance Amount", name: "balance_amount", category: "financial", value: "₹52,500" },
  { label: "Studio Name", name: "studio_name", category: "studio", value: "Pixel Perfection" },
  { label: "Studio GSTIN", name: "studio_gstin", category: "studio", value: "27AAAAA0000A1Z5" },
];

interface ContractEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
}

export function ContractEditor({ initialContent, onChange }: ContractEditorProps) {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (varName: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const placeholder = `{{${varName}}}`;
    const newContent = content.substring(0, start) + placeholder + content.substring(end);
    
    setContent(newContent);
    onChange(newContent);

    // Reset cursor position after insert
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
    }, 0);
  };

  const getPreviewHtml = (html: string) => {
    let preview = html;
    contractVariables.forEach(v => {
      const regex = new RegExp(`\\{\\{${v.name}\\}\\}`, 'g');
      preview = preview.replace(regex, `<span class="bg-blue-50 text-blue-700 px-1 rounded font-bold border border-blue-100">${v.value || match[0]}</span>`);
    });
    return preview;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-280px)] min-h-[600px]">
      {/* Editor Side */}
      <div className="flex flex-col border rounded-3xl bg-white shadow-xl overflow-hidden overflow-visible relative group">
        <div className="p-4 bg-slate-50/80 backdrop-blur border-b flex items-center justify-between sticky top-0 z-10 rounded-t-3xl">
           <div className="flex gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 font-bold">
                    <Sparkles className="w-3.5 h-3.5 mr-2 text-primary" /> Insert Variable <ChevronDown className="w-3 h-3 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="start">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Available Fields
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <div className="px-2 py-1.5">
                       <Input placeholder="Search fields..." className="h-8 text-xs mb-2" />
                    </div>
                    {["client", "event", "financial", "studio"].map((cat) => (
                      <div key={cat} className="mb-2 last:mb-0">
                         <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-400 tracking-widest">{cat}</div>
                         {contractVariables.filter(v => v.category === cat).map(v => (
                           <DropdownMenuItem key={v.name} onClick={() => insertVariable(v.name)} className="text-sm font-medium">
                              {v.label} <span className="ml-auto text-[10px] font-mono opacity-40">{v.name}</span>
                           </DropdownMenuItem>
                         ))}
                      </div>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
           </div>
           
           <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> Auto-saving
              </Badge>
           </div>
        </div>

        <textarea
          ref={textareaRef}
          className="flex-1 w-full p-8 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-white selection:bg-primary/10"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="<h1>Service Agreement</h1><p>This agreement is between {{studio_name}} and {{client_name}}...</p>"
        />
        
        <div className="p-4 bg-slate-50/50 border-t flex items-center gap-4">
           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <Info className="w-3.5 h-3.5" /> HTML mode active
           </div>
           <div className="ml-auto text-[10px] text-slate-400 font-bold">
              {content.length} characters
           </div>
        </div>
      </div>

      {/* Preview Side */}
      <div className="flex flex-col border-2 border-slate-100 rounded-3xl bg-slate-50/30 shadow-inner overflow-hidden">
        <div className="p-4 bg-white/50 border-b flex items-center gap-2">
           <Badge variant="outline" className="text-[10px] font-black border-slate-200">Live Render</Badge>
           <p className="text-xs text-slate-400">Values are shown for Priya Sharma (example)</p>
        </div>
        
        <div className="flex-1 overflow-auto p-12 bg-white">
           <article 
             className="prose prose-slate prose-sm max-w-none 
                        prose-h1:text-center prose-h1:text-4xl prose-h1:font-black prose-h1:tracking-tighter prose-h1:mb-12
                        prose-p:leading-relaxed prose-p:text-slate-600
                        prose-strong:text-slate-900 prose-strong:font-bold
                        prose-mark:bg-blue-50/50 prose-mark:text-blue-700 prose-mark:px-1"
             dangerouslySetInnerHTML={{ __html: getPreviewHtml(content) }}
           />
        </div>

        <div className="p-4 border-t bg-slate-50/50 text-center">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Contract Preview Page
           </p>
        </div>
      </div>
    </div>
  );
}
