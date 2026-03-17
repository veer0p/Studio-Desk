"use client";

import { usePortalSession } from "@/lib/portal/session";
import { SessionExpiredScreen } from "@/components/portal/SessionExpiredScreen";
import { ContractEditor } from "@/components/contracts/ContractEditor"; // Assuming reusable from previous steps
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function PortalContractPage() {
  const { session, isLoading, isValid, sessionToken } = usePortalSession();
  const [isSigned, setIsSigned] = useState(false);

  if (isLoading) return null;
  if (!isValid) return <SessionExpiredScreen studio={session?.studio} />;

  const handleSign = async (signatureData: string) => {
    try {
      const res = await fetch(`/api/portal/${sessionToken}/contract/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature_data: signatureData, signer_name: "Client Name" })
      });
      if (!res.ok) throw new Error();
      setIsSigned(true);
      toast.success("Contract signed successfully!");
    } catch (error) {
      toast.error("Failed to sign contract");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50" asChild>
            <Link href="/booking">
               <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Link>
         </Button>
         <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Booking Contract</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Review & Sign</p>
         </div>
      </div>

      {!isSigned ? (
        <div className="space-y-6">
           <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                 <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                 <p className="text-xs font-black text-slate-900">Immediate Action Required</p>
                 <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                    Please read the terms below carefully. You can sign digitally using your touch screen or mouse.
                 </p>
              </div>
           </div>

           {/* Contract content simulation */}
           <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm prose prose-sm max-w-none">
              <h2 className="text-slate-900 font-black">Photography Service Agreement</h2>
              <p>This agreement is between <strong>Studio Name</strong> and <strong>Client Name</strong> regarding the event scheduled for <strong>Dec 25, 2025</strong>.</p>
              <h3>1. Scope of Work</h3>
              <p>The studio will provide full coverage of the wedding ceremony and reception, including high-resolution digital files and a private online gallery.</p>
              <h3>2. Payment Terms</h3>
              <p>A non-refundable advance of 30% is due upon signing. The balance is due 7 days before the event date.</p>
           </div>

           {/* Signing Area Placeholder - In real world would use SignaturePad */}
           <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-dashed border-slate-200 text-center space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sign here</p>
              <div className="h-32 bg-white rounded-2xl border border-slate-100 shadow-inner flex items-center justify-center text-slate-300 font-mono text-xs">
                 [ Signature Pad ]
              </div>
              <Button className="w-full h-14 rounded-2xl bg-primary shadow-xl shadow-primary/20 font-black text-xs uppercase tracking-widest" onClick={() => handleSign("base64data")}>
                 Complete Signing
              </Button>
           </div>
        </div>
      ) : (
        <div className="space-y-6 text-center py-20 animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-12 h-12" />
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Contract Signed!</h2>
              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                 Your agreement is now active. You can download the signed copy for your records anytime.
              </p>
           </div>
           <div className="pt-6 flex flex-col gap-3">
              <Button className="h-14 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest gap-2">
                 <Download className="w-4 h-4" /> Download Signed PDF
              </Button>
              <Button variant="ghost" className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest" asChild>
                 <Link href="/booking">Back to Dashboard</Link>
              </Button>
           </div>
        </div>
      )}
    </div>
  );
}
