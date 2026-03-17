"use client";

import { Lock, Phone, MessageSquare, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionExpiredScreenProps {
  studio?: {
    name: string;
    phone: string | null;
  };
}

export function SessionExpiredScreen({ studio }: SessionExpiredScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
       <div className="relative">
          <div className="w-32 h-32 bg-slate-50 rounded-[3.5rem] flex items-center justify-center text-slate-200 relative z-10">
             <Lock className="w-12 h-12" />
          </div>
          <div className="absolute -inset-4 bg-primary/5 rounded-[4rem] animate-pulse" />
       </div>

       <div className="space-y-4">
          <div className="space-y-2">
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Session Expired</h2>
             <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                For your security, portal sessions expire after 7 days of inactivity.
             </p>
          </div>
       </div>

       <div className="w-full space-y-6">
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact {studio?.name || 'Your Studio'}</p>
                <div className="flex flex-col gap-3 pt-4">
                   {studio?.phone && (
                     <>
                        <Button className="h-14 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest gap-3" asChild>
                           <a href={`tel:${studio.phone}`}><Phone className="w-4 h-4" /> Call Studio</a>
                        </Button>
                        <Button variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white font-black text-xs uppercase tracking-widest gap-3" asChild>
                           <a href={`https://wa.me/${studio.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                              <MessageSquare className="w-4 h-4 text-emerald-500" /> WhatsApp
                           </a>
                        </Button>
                     </>
                   )}
                </div>
             </div>
          </div>

          <div className="flex items-center gap-3 px-6 text-left">
             <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                <Info className="w-4 h-4" />
             </div>
             <p className="text-[11px] font-bold text-slate-400 leading-tight">
                To resume access, please find the original link in your email or request a new one from your studio.
             </p>
          </div>
       </div>
    </div>
  );
}
