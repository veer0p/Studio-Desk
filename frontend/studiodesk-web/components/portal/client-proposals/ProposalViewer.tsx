// components/portal/client-proposals/ProposalViewer.tsx
"use client"

import { ProposalAcceptBar } from "./ProposalAcceptBar"

export function ProposalViewer({ studioSlug, proposalId }: { studioSlug: string, proposalId: string }) {
  
  const studioName = studioSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
  
  return (
    <div className="w-full relative pb-24">
      
      <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Header Cover */}
        <div className="h-48 w-full bg-muted/30 relative flex items-center justify-center overflow-hidden border-b border-border/60">
           <div className="absolute inset-0 bg-muted/10 pointer-events-none" />
           <h1 className="text-3xl font-bold tracking-tight text-foreground relative z-10 text-center px-4">
              Proposal for Priya & Raj
           </h1>
        </div>

        {/* Payload Core */}
        <div className="p-6 md:p-10 space-y-10">
           
           <div>
             <h3 className="text-lg font-bold tracking-tight mb-2">A message from {studioName}</h3>
             <p className="text-sm text-muted-foreground leading-relaxed">
               Hello Rohan, thank you for considering us to cover your beautiful upcoming events. Based on our conversation, we have curated the perfect package that ensures every moment is captured cinematically. Please review the details below.
             </p>
           </div>

           <div>
             <h3 className="text-lg font-bold tracking-tight border-b border-border/40 pb-2 mb-4">Package Scope</h3>
             <div className="bg-muted/30 p-4 rounded-lg space-y-3 text-sm">
               <div className="flex justify-between border-b border-border/40 pb-2">
                 <span className="text-muted-foreground">Event Type</span>
                 <span className="font-semibold text-foreground">2-Day Wedding Coverage</span>
               </div>
               <div className="flex justify-between border-b border-border/40 pb-2">
                 <span className="text-muted-foreground">Location</span>
                 <span className="font-semibold text-foreground">Taj Mahal Palace, Mumbai</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Dates</span>
                 <span className="font-semibold text-foreground">24-25 April 2026</span>
               </div>
             </div>
           </div>

           <div>
             <h3 className="text-lg font-bold tracking-tight border-b border-border/40 pb-2 mb-4">Core Deliverables</h3>
             <ul className="space-y-3 text-sm text-muted-foreground">
               <li className="flex items-start gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--portal-primary))] mt-1.5 shrink-0" />
                 <span><strong className="text-foreground">Full Cinematic Highlight Film</strong> (10-14 Minutes, Licensed Music)</span>
               </li>
               <li className="flex items-start gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--portal-primary))] mt-1.5 shrink-0" />
                 <span><strong className="text-foreground">Traditional 4K Documentary</strong> (60-90 Minutes chronological cut)</span>
               </li>
               <li className="flex items-start gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--portal-primary))] mt-1.5 shrink-0" />
                 <span><strong className="text-foreground">1500+ High-Resolution Mastered Photos</strong> inside Cloud Gallery</span>
               </li>
               <li className="flex items-start gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--portal-primary))] mt-1.5 shrink-0" />
                 <span><strong className="text-foreground">1 Premium Canvera Album</strong> (50 sheets, custom layout)</span>
               </li>
             </ul>
           </div>

           <div>
             <h3 className="text-lg font-bold tracking-tight border-b border-border/40 pb-2 mb-4">Investment Tracker</h3>
             <div className="bg-muted/30 p-5 rounded-xl space-y-4">
               <div className="flex justify-between items-center pb-4 border-b border-border/40">
                 <span className="font-semibold">Subtotal</span>
                 <span className="font-mono text-base tracking-wider">₹4,50,000</span>
               </div>
               <div className="flex justify-between items-center text-[15px]">
                 <span className="text-muted-foreground">Advance Due (50%)</span>
                 <span className="font-mono tracking-wider">₹2,25,000</span>
               </div>
               <div className="flex justify-between items-center text-[15px]">
                 <span className="text-muted-foreground">Balance Before Event</span>
                 <span className="font-mono tracking-wider">₹2,25,000</span>
               </div>
             </div>
           </div>

           <div>
             <h3 className="text-lg font-bold tracking-tight border-b border-border/40 pb-2 mb-4">Terms & Conditions</h3>
             <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
               <p>1. The studio retains international copyright over raw photographic materials. The client is granted personal usage licenses universally.</p>
               <p>2. Travel and accommodation outside of Mumbai municipal limits will be borne strictly by the client separately.</p>
               <p>3. Advance payments are strictly non-refundable securing our studio block dates indefinitely.</p>
             </div>
           </div>

        </div>

      </div>

      <ProposalAcceptBar studioSlug={studioSlug} />

    </div>
  )
}
