"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ShieldCheck, XCircle, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/button"; // Using button as card variant or fix import
import { Button } from "@/components/ui/button";

export default function PortalAccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'error' | 'expired'>('verifying');
  const [studioInfo, setStudioInfo] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch('/api/portal/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (res.status === 410) {
          const data = await res.json();
          setStudioInfo(data.studio);
          setStatus('expired');
          return;
        }

        if (!res.ok) {
          setStatus('error');
          return;
        }

        const data = await res.json();
        localStorage.setItem('portal_token', data.session_token);
        router.push('/booking');
      } catch (error) {
        setStatus('error');
      }
    };

    verify();
  }, [searchParams, router]);

  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
         <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center relative mb-8">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="absolute inset-0 rounded-[2.5rem] border-4 border-primary/10 border-t-primary" />
         </div>
         <h2 className="text-xl font-black text-slate-900 tracking-tight">Verifying your access...</h2>
         <p className="text-sm text-slate-400 font-medium mt-2">Securing your session</p>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="space-y-8 py-10 text-center animate-in slide-in-from-bottom-4">
         <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-amber-500 shadow-inner">
            <Clock className="w-12 h-12" />
         </div>
         <div className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Link Expired</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
               Access links are valid for 72 hours. For your security, this link has expired.
            </p>
         </div>
         
         <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact {studioInfo?.name || 'Studio'}</p>
            <div className="flex flex-col gap-3">
               <Button className="h-14 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest" asChild>
                  <a href={`tel:${studioInfo?.phone}`}>Call {studioInfo?.phone}</a>
               </Button>
               <Button variant="outline" className="h-14 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest">
                  Request via Email
               </Button>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-10 text-center animate-in slide-in-from-bottom-4">
       <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner">
          <XCircle className="w-12 h-12" />
       </div>
       <div className="space-y-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Invalid Link</h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
             We couldn't verify this access link. Please check your email for the correct link or contact your studio.
          </p>
       </div>
       <Button variant="ghost" className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 gap-2" asChild>
          <a href="/">Go to Home <ChevronRight className="w-4 h-4" /></a>
       </Button>
    </div>
  );
}
