"use client";

import { Key, Copy, Check, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

export default function APIKeysPage() {
  const [showKey, setShowKey] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "Configure your key in environment variables";

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">API Keys</h1>
          <p className="text-sm font-medium text-slate-400">Integrate StudioDesk with your custom workflows</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
               <Key className="w-5 h-5" />
            </div>
            <div>
               <h3 className="text-sm font-black text-slate-900 tracking-tight">Main Production Key</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Restricted to Studio Context</p>
            </div>
         </div>

         <div className="space-y-4">
            <div className="relative group">
               <Input 
                 type={showKey ? "text" : "password"} 
                 value={apiKey} 
                 readOnly 
                 className="h-16 rounded-[1.5rem] px-6 bg-slate-50 border-slate-200 font-mono text-xs focus-visible:ring-0 shadow-inner group-hover:bg-slate-100 transition-colors"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => setShowKey(!showKey)}>
                     {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => {
                     navigator.clipboard.writeText(apiKey);
                     toast.success("Key copied to clipboard");
                  }}>
                     <Copy className="w-4 h-4" />
                  </Button>
               </div>
            </div>
            
            <div className="flex items-center justify-between px-2">
               <p className="text-[10px] font-bold text-slate-300">Created: Oct 10, 2025 • Never Rotated</p>
               <Button variant="ghost" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50">Revoke Key</Button>
            </div>
         </div>

         <div className="p-8 bg-rose-50/50 rounded-[2rem] border border-rose-100 flex gap-6">
            <AlertTriangle className="w-10 h-10 text-rose-500 shrink-0" />
            <div className="space-y-2">
               <p className="text-[11px] font-black text-rose-900 uppercase tracking-widest leading-none">Security Warning</p>
               <p className="text-[11px] font-bold text-rose-800/60 leading-relaxed">
                  Treat your API keys like passwords. Do not share them or commit them to version control. If a key is compromised, revoke it immediately and generate a new one.
               </p>
            </div>
         </div>
      </div>

      <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 space-y-6 text-center">
         <div className="space-y-2">
            <h4 className="text-lg font-black text-slate-900 tracking-tight">Need help with integration?</h4>
            <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto">
               Check our developer documentation for SDKs and Postman collections.
            </p>
         </div>
         <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2">
            View Docs <ChevronRight className="w-4 h-4" />
         </Button>
      </div>
    </div>
  );
}
