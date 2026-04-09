// components/portal/client-proposals/ProposalAcceptBar.tsx
"use client"

import { useState } from "react"
import { MessageCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ProposalAcceptBar({ studioSlug }: { studioSlug: string }) {
  const [accepted, setAccepted] = useState(false)

  if (accepted) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/40 p-4 shadow-lg flex items-center justify-center animate-in slide-in-from-bottom-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
          <Check className="w-5 h-5" /> Proposal Accepted Successfully 
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/40 p-4 shadow-lg animate-in slide-in-from-bottom-8">
       <div className="container mx-auto max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
         
         <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
           Have questions?
           <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center gap-1">
             <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Us
           </a>
         </p>

         <Button 
           size="lg" 
           className="w-full sm:w-auto font-bold tracking-tight bg-[hsl(var(--portal-primary))] hover:bg-[hsl(var(--portal-primary))/90]"
           onClick={() => {
             // Mock Confirmation logic passing backend mutation safely
             if(confirm("By accepting, you commit to booking this package for ₹4,50,000. Proceed to generate legal agreement?")) {
               setAccepted(true)
             }
           }}
         >
           Accept Proposal ✨
         </Button>

       </div>
    </div>
  )
}
