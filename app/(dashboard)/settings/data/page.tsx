"use client";

import { AlertTriangle, Download, Trash2, Shield, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function DataPrivacyPage() {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data & Privacy</h1>
          <p className="text-sm font-medium text-slate-400">Manage your data ownership and compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Section */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                 <Download className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Data Ownership</h3>
           </div>

           <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                 You can download a complete export of your studio data in JSON format at any time. This includes all clients, projects, and financial records.
              </p>
              <Button className="h-12 px-6 rounded-xl border-slate-200 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest gap-2">
                 Generate Full Export
              </Button>
           </div>
        </div>

        {/* DPDP Compliance */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                 <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">DPDP 2023 Compliance</h3>
           </div>

           <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                 Your studio is configured to comply with India's Digital Personal Data Protection Act. Client data is encrypted at rest.
              </p>
              <div className="flex items-center gap-3 text-emerald-600">
                 <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Active Protection</span>
              </div>
           </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 space-y-8">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
               <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-rose-900 tracking-tight">Danger Zone</h3>
         </div>

         <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-1 bg-white/50 rounded-[2rem] border border-rose-100">
            <div className="p-8 space-y-2">
               <h4 className="text-sm font-black text-rose-950 tracking-tight">Delete Studio Account</h4>
               <p className="text-[11px] font-bold text-rose-800/60 leading-relaxed max-w-sm">
                  This action is irreversible. All clients, photos, galleries, and history will be permanently wiped from our servers.
               </p>
            </div>
            <div className="p-8">
               <Button variant="ghost" className="h-14 px-8 rounded-2xl bg-rose-500 text-white hover:bg-rose-600 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-200">
                  Delete Permanently
               </Button>
            </div>
         </div>
      </div>

      <div className="flex items-center justify-center gap-3 text-slate-300">
         <Info className="w-4 h-4" />
         <p className="text-[10px] font-bold uppercase tracking-widest">Last data audit: Oct 01, 2025</p>
      </div>
    </div>
  );
}
