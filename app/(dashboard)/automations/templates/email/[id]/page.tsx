"use client";

import { 
  ChevronLeft, 
  Save, 
  Send, 
  FileCode, 
  Monitor, 
  Smartphone, 
  Eye, 
  Code2,
  Settings,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EmailEditorPage({ params }: { params: { id: string } }) {
  const [code, setCode] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    .body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; }
    .header { color: #1A3C5E; font-size: 24px; font-weight: 900; }
    .btn { background: #2A7EC8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
  </style>
</head>
<body class="body">
  <h1 class="header">Hello {{client_name}}!</h1>
  <p>Thank you for inquiring with StudioDesk. We are thrilled to help you capture your special moments.</p>
  <br/>
  <a href="{{form_url}}" class="btn">View Packages</a>
</body>
</html>`);

  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    toast.success("Email template updated successfully");
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col -m-8 overflow-hidden">
      {/* Editor Header */}
      <div className="h-16 border-b border-slate-100 bg-white flex items-center justify-between px-8 shrink-0">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" asChild>
               <Link href="/automations/templates">
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
               </Link>
            </Button>
            <div className="h-6 w-px bg-slate-100 mx-1" />
            <div className="flex items-center gap-3">
               <FileCode className="w-5 h-5 text-primary" />
               <span className="font-bold text-slate-900">Lead Welcome Email</span>
               <Badge className="bg-slate-50 text-slate-400 border-none px-2 h-5 text-[9px] font-black lowercase tracking-widest">v2.4.0</Badge>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-10 px-4 rounded-xl font-bold text-xs gap-2 text-slate-400 hover:text-primary">
               <Send className="w-4 h-4" /> Send Test
            </Button>
            <Button className="h-10 px-6 rounded-xl font-bold bg-slate-900 shadow-xl shadow-slate-200" onClick={handleSave} disabled={isSaving}>
               {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
            </Button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Left Side: Code Editor */}
         <div className="w-1/2 border-r border-slate-100 flex flex-col bg-[#1e1e1e] relative">
            <div className="h-10 bg-[#2d2d2d] flex items-center px-4 gap-6 shrink-0">
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5" /> HTML Code
               </div>
               <div className="text-[10px] font-black uppercase tracking-widest text-[#2A7EC8] border-b border-[#2A7EC8] h-full flex items-center px-2">index.html</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center px-2">styles.css</div>
            </div>
            <textarea 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 p-8 bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none scrollbar-hide"
              spellCheck={false}
            />
            <div className="absolute bottom-6 right-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 space-y-2 max-w-[240px]">
               <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Available Variables</span>
               </div>
               <div className="flex flex-wrap gap-1.5">
                  {["client_name", "first_name", "studio_name", "total_amount", "booking_date"].map(v => (
                    <code key={v} className="bg-white/10 text-white text-[9px] px-1.5 py-0.5 rounded italic opacity-70">
                       &#123;&#123;{v}&#125;&#125;
                    </code>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Side: Preview */}
         <div className="w-1/2 bg-slate-50 flex flex-col">
            <div className="h-12 border-b border-slate-100 bg-white flex items-center justify-between px-6 shrink-0">
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" /> Live Preview
               </div>
               <div className="flex bg-slate-100 p-1 rounded-lg">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-7 w-7 rounded-sm", previewMode === 'desktop' ? 'bg-white shadow-sm' : '')}
                    onClick={() => setPreviewMode('desktop')}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-7 w-7 rounded-sm", previewMode === 'mobile' ? 'bg-white shadow-sm' : '')}
                    onClick={() => setPreviewMode('mobile')}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </Button>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12">
               <div className={cn(
                 "bg-white shadow-2xl rounded-3xl mx-auto transition-all duration-500 overflow-hidden",
                 previewMode === 'desktop' ? "w-full min-h-full" : "w-[375px] h-[667px]"
               )}>
                  <div className="h-14 bg-slate-50 border-b border-slate-100 flex items-center px-6 gap-3">
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-200" />
                     </div>
                  </div>
                  <iframe 
                    title="Email Preview"
                    srcDoc={code}
                    className="w-full h-full border-none"
                  />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
