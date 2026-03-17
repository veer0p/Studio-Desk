"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  ArrowRight, 
  AlertCircle,
  History,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/contracts/SignaturePad";

export default function PublicContractClient({ contract }: { contract: any }) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signatureData, setSignatureData] = useState("");
  const [isSigned, setIsSigned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
      if (isBottom) setHasScrolledToBottom(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSign = async () => {
    if (signerName.toLowerCase() !== contract.client.full_name.toLowerCase()) {
      toast.error(`Please match the client name: ${contract.client.full_name}`);
      return;
    }
    if (!signatureData) {
      toast.error("Please provide a signature");
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSigned(true);
      toast.success("Agreement signed successfully!");
    } catch (error) {
      toast.error("Failed to sign contract");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSigned) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
           <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
           </div>
           <div className="space-y-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Contract Signed!</h1>
              <p className="text-slate-500">The agreement has been securely executed and a copy is being sent to your email.</p>
           </div>
           <Card className="border-none bg-white shadow-2xl shadow-slate-200/50 p-8 space-y-6">
              <div className="flex justify-between items-center text-left">
                 <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed At</div>
                    <div className="text-sm font-bold text-slate-900">{format(new Date(), "PPpp")}</div>
                 </div>
                 <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 font-black text-[10px]">VERIFIED</Badge>
              </div>
              <Button className="w-full h-12 bg-slate-900 shadow-xl">
                 <Download className="w-4 h-4 mr-2" /> Download Your Copy
              </Button>
           </Card>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Agreement ID: {contract.id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 md:py-24 px-4 bg-white shadow-2xl min-h-screen relative">
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center">
           <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-black uppercase text-slate-900 tracking-widest">Processing Secure Signature...</p>
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16 pb-12 border-b">
         <div className="space-y-4">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl font-black">
               {contract.studio.name.charAt(0)}
            </div>
            <div>
               <h2 className="text-xl font-bold text-slate-900">{contract.studio.name}</h2>
               <p className="text-xs text-slate-500 max-w-[200px]">{contract.studio.address}</p>
            </div>
         </div>
         <div className="text-left md:text-right space-y-1">
            <h1 className="text-4xl font-black text-slate-200 uppercase tracking-tighter">Agreement</h1>
            <p className="text-xs font-bold text-slate-900">{contract.booking.title}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ref: {contract.id}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 max-w-2xl mx-auto">
         <div className="space-y-12">
            <article 
              className="prose prose-slate max-w-none 
                         prose-h1:text-4xl prose-h1:font-black prose-h1:mb-12
                         prose-p:text-slate-600 prose-p:leading-relaxed
                         prose-strong:text-slate-900 prose-strong:font-black"
              dangerouslySetInnerHTML={{ __html: contract.content_html }}
            />

            <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-primary">
               <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5" /> Legal Disclosure
               </h3>
               <p className="text-xs text-slate-600 leading-relaxed">
                  By executing this document via electronic signature, you understand that this digital intent is equivalent to an ink signature on paper and is legally binding in accordance with the <strong>Information Technology Act, 2000 (India)</strong>.
               </p>
            </div>

            <div className={`space-y-8 pt-12 border-t transition-all duration-1000 ${hasScrolledToBottom ? 'opacity-100 translate-y-0' : 'opacity-20 blur-sm pointer-events-none translate-y-8'}`}>
               <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign the Agreement</h2>
                  <p className="text-sm text-slate-500">Please type your name and provide your signature below.</p>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Full Legal Name</Label>
                     <Input 
                        placeholder="Type your full name exactly" 
                        value={signerName}
                        onChange={(e) => setSignerName(e.target.value)}
                        className="h-12 border-slate-200 focus:border-slate-900 focus:ring-0 text-lg font-bold"
                     />
                     {signerName && signerName.toLowerCase() !== contract.client.full_name.toLowerCase() && (
                       <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1.5 uppercase tracking-widest">
                          <AlertCircle className="w-3 h-3" /> Name must match: {contract.client.full_name}
                       </p>
                     )}
                  </div>

                  <div className="space-y-2">
                     <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Your Signature</Label>
                     <SignaturePad 
                       signerName={signerName} 
                       onSignatureCapture={setSignatureData} 
                     />
                  </div>

                  <Button 
                    className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-lg font-black shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    size="lg"
                    onClick={handleSign}
                    disabled={isSubmitting || !signerName || !signatureData}
                  >
                    Accept & Sign Agreement <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
               </div>
            </div>
         </div>
      </div>

      {!hasScrolledToBottom && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-xl border border-slate-100 px-6 py-3 rounded-full flex items-center gap-3 animate-bounce">
           <History className="w-4 h-4 text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest text-primary">Scroll to read and sign</span>
        </div>
      )}

      <div className="mt-24 pt-8 border-t flex flex-col items-center gap-4 opacity-30 select-none">
         <p className="text-[10px] font-bold uppercase tracking-[0.3em]">SECURE E-SIGN PORTAL</p>
         <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Verified by StudioDesk Compliance</span>
         </div>
      </div>
    </div>
  );
}
