"use client";

import { 
  MessageSquare, 
  User, 
  Clock, 
  Smartphone,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AutomationMessagePreviewProps {
  type: "whatsapp" | "email";
  templateId: string;
  enabled: boolean;
}

export function AutomationMessagePreview({ type, templateId, enabled }: AutomationMessagePreviewProps) {
  if (!enabled) {
    return (
      <div className="h-[500px] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10 space-y-4">
         <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
            {type === 'whatsapp' ? <MessageSquare className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
         </div>
         <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Channel Disabled</h4>
            <p className="text-[11px] text-slate-400 font-medium">Enable this channel to see a live preview of the automation content.</p>
         </div>
      </div>
    );
  }

  if (type === 'whatsapp') {
    return (
      <div className="w-[320px] mx-auto bg-slate-900 rounded-[3rem] p-4 shadow-2xl relative">
         <div className="h-6 w-1/3 bg-slate-800 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 z-10" />
         <div className="bg-[#e5ddd5] rounded-[2.5rem] h-[450px] overflow-hidden flex flex-col p-4 relative pt-10">
            {/* WhatsApp Wallpapper */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://i.pinimg.com/originals/ab/ab/60/abab60f2467d0cf90089856f6168e983.png')" }} />
            
            <div className="relative z-10 space-y-4">
               {/* Client Name Label */}
               <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 w-fit mx-auto border border-white/20">
                  <User className="w-3 h-3 text-slate-600" />
                  <span className="text-[10px] font-bold text-slate-600">Priya Sharma</span>
               </div>

               {/* Message Bubble */}
               <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[85%] self-start animate-in slide-in-from-left-4 duration-500">
                  <div className="text-[13px] text-[#303030] leading-snug">
                     Hi <span className="font-bold text-[#075e54]">Priya</span>! 👋 Thanks for inquiring with <span className="font-bold text-[#075e54]">LensCraft Studios</span>. We've received your inquiry for <span className="font-bold text-[#075e54]">Wedding Photography</span>. We'll get back to you shortly!
                  </div>
                  <div className="text-[9px] text-slate-400 text-right mt-1">10:45 AM</div>
               </div>

               {/* Quick Reply Button */}
               <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 text-center border border-white shadow-sm flex items-center justify-center gap-2 cursor-default group hover:bg-white transition-colors">
                  <MessageSquare className="w-4 h-4 text-[#075e54]" />
                  <span className="text-xs font-bold text-[#075e54]">View Packages</span>
               </div>
            </div>
         </div>
         <div className="h-1.5 w-1/3 bg-slate-800 rounded-full mx-auto mt-4" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 min-h-[500px] flex flex-col">
       <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between shrink-0">
          <div className="flex gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-rose-200" />
             <div className="w-2.5 h-2.5 rounded-full bg-amber-200" />
             <div className="w-2.5 h-2.5 rounded-full bg-emerald-200" />
          </div>
          <div className="bg-slate-200/50 rounded-lg px-4 py-1.5 text-[10px] font-mono text-slate-400">
             hello@studiodesk.in
          </div>
       </div>
       <div className="p-10 space-y-6">
          <div className="space-y-2">
             <h3 className="text-2xl font-black text-[#1A3C5E] tracking-tight">Hello Priya!</h3>
             <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Thank you for inquiring with LensCraft Studios. We are thrilled to help you capture your special moments.
             </p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                   <Info className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inquiry Received</p>
                   <p className="text-xs font-bold text-slate-900">Wedding Photography • March 2024</p>
                </div>
             </div>
             <button className="w-full bg-[#2A7EC8] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:scale-[1.02] transition-transform">
                View All Packages
             </button>
          </div>
          <div className="pt-10 border-t border-slate-50 text-center">
             <p className="text-[10px] text-slate-300 font-medium">
                Sent automatically by StudioDesk. You're receiving this because you filled an inquiry form.
             </p>
          </div>
       </div>
    </div>
  );
}
