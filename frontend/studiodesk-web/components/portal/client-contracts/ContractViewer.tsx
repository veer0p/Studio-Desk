// components/portal/client-contracts/ContractViewer.tsx
"use client"

import { useState } from "react"
import { SignatureCanvas } from "./SignatureCanvas"
import { Button } from "@/components/ui/button"
import { FileSignature, ShieldCheck, Download, Edit3, Type } from "lucide-react"

export function ContractViewer({ studioSlug, contractId }: { studioSlug: string, contractId: string }) {
  const [signature, setSignature] = useState("")
  const [signed, setSigned] = useState(false)
  
  const studioName = studioSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

  const handleSign = () => {
    if(signature) {
      setSigned(true)
    }
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="mb-6 bg-card border border-border/60 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="inline-flex items-center rounded-lg bg-orange-500/10 px-2.5 py-1 text-sm font-semibold tracking-wide text-orange-600 mb-2 border border-orange-500/20">
             Service Agreement
           </div>
           <h1 className="text-2xl font-bold tracking-tight text-foreground">{studioName} ↔ Priya Sharma</h1>
           <p className="text-sm text-muted-foreground mt-1">Contract generating execution limits for <span className="font-semibold text-foreground">25 Apr 2026</span></p>
        </div>
        {signed && (
           <Button variant="outline" className="font-semibold" size="sm">
             <Download className="w-4 h-4 mr-2" /> Download PDF
           </Button>
        )}
      </div>

      <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm relative">
        
        {/* Document Scroll Layout */}
        <div className="w-full h-[50vh] min-h-[400px] overflow-y-auto p-6 sm:p-10 text-sm leading-relaxed text-muted-foreground font-serif border-b border-border/40 custom-scrollbar relative">
          
          <h2 className="text-xl font-bold text-foreground mb-6 font-sans tracking-tight text-center underline underline-offset-4">WEDDING PHOTOGRAPHY & CINEMATOGRAPHY CONTRACT</h2>

          <p className="mb-4">This Service Agreement is explicitly executed strictly between <strong>{studioName}</strong> (hereafter referred to as "Studio") and <strong>Priya Sharma</strong> (hereafter referred to as "Client") mapping standard event liabilities spanning universally.</p>

          <h3 className="font-bold text-foreground mt-8 mb-2 font-sans tracking-tight">1. SCOPE OF SERVICES</h3>
          <p className="mb-4">The Studio agrees to natively extract visual deliverables across the explicitly confirmed 2-day timeline overlapping the "Taj Mahal Palace, Mumbai" properties natively adhering to strict local venue constraints uniquely. The final pipeline covers a 14-minute cinematic loop alongside 1,500 highly graded photo matrices permanently.</p>

          <h3 className="font-bold text-foreground mt-8 mb-2 font-sans tracking-tight">2. FINANCIAL TERMS</h3>
          <p className="mb-4">The complete baseline package requires ₹4,50,000 INR explicitly. A strict 50% retainer structurally bounds the event dates, acting securely as completely non-refundable insurance preventing parallel studio deployments cleanly. Remainder dues trigger 24 hours preceding the event date via explicit Razorpay hooks universally.</p>

          <h3 className="font-bold text-foreground mt-8 mb-2 font-sans tracking-tight">3. CANCELLATION MATRICES</h3>
          <p className="mb-4">Standard 30-day cancellation overlays structurally forfeit explicit retainers avoiding studio scheduling losses. Re-scheduling acts subjectively depending entirely upon subsequent date availabilities mapped alongside standard 15% rate inflations strictly.</p>

          <h3 className="font-bold text-foreground mt-8 mb-2 font-sans tracking-tight">4. COPYRIGHT & LIKENESS ABSTRACTIONS</h3>
          <p className="mb-8">The Studio completely preserves intrinsic copyright bounds executing marketing usage rules parallel to Client's unlimited personal-distribution licenses seamlessly.</p>

        </div>

        {/* Signature Area */}
        <div className="p-6 sm:p-10 bg-muted/10">
           
           <h3 className="text-base font-bold text-foreground tracking-tight mb-6 flex items-center gap-2">
             <FileSignature className="w-5 h-5 text-[hsl(var(--portal-primary))]" /> Execution & Authorization
           </h3>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
             
             {/* Studio Block */}
             <div>
               <p className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-widest">Studio Signature</p>
               <div className="h-40 border-b border-border/80 flex flex-col justify-end pb-2 opacity-60">
                 <span className="font-signature text-4xl mb-2">{studioName}</span>
               </div>
               <p className="text-xs text-muted-foreground mt-2">Date: 12 Mar 2026</p>
             </div>

             {/* Client Block */}
             <div>
               <div className="flex items-center justify-between mb-3">
                 <p className="text-sm font-semibold text-[hsl(var(--portal-primary))] uppercase tracking-widest">Client Signature</p>
               </div>
               
               {!signed ? (
                 <>
                   <SignatureCanvas onSign={setSignature} />
                   <div className="mt-8 flex justify-end">
                     <Button 
                       size="lg" 
                       className="w-full font-bold tracking-tight bg-[hsl(var(--portal-primary))] hover:bg-[hsl(var(--portal-primary))/90]"
                       disabled={!signature}
                       onClick={handleSign}
                     >
                       Sign Document & Seal Contract ✨
                     </Button>
                   </div>
                 </>
               ) : (
                 <div className="animate-in fade-in zoom-in-95 duration-300">
                    <div className="h-40 border-b border-[hsl(var(--portal-primary))/40] flex flex-col justify-end pb-2 relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                         <ShieldCheck className="w-32 h-32 text-emerald-500" />
                      </div>
                      {signature && <img src={signature} alt="Client Signature" className="max-h-32 object-contain filter drop-shadow-sm mix-blend-multiply dark:mix-blend-screen dark:invert" />}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Digitally Embedded & Verified</p>
                      <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString('en-GB')}</p>
                    </div>
                 </div>
               )}

             </div>

           </div>

        </div>

      </div>

    </div>
  )
}

function CheckCircle2(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
}
