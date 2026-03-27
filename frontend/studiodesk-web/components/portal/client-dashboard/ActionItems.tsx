// components/portal/client-dashboard/ActionItems.tsx
"use client"

import Link from "next/link"
import { AlertCircle, FileSignature, IndianRupee, Image as ImageIcon, FileText } from "lucide-react"

export function ActionItems({ studioSlug }: { studioSlug: string }) {
  
  // Simulated Pending Flags capturing business matrix loops natively.
  const actions = [
    {
      id: "contract",
      title: "Signature Required",
      desc: "Please sign your contract for Priya's Mehndi",
      icon: FileSignature,
      cta: "Sign now →",
      link: `/portal/${studioSlug}/contracts/101`,
      color: "blue"
    },
    {
      id: "invoice",
      title: "Payment Due",
      desc: "Invoice INV-2026-047 of ₹45,000 is due on 12 Apr 2026",
      icon: IndianRupee,
      cta: "Pay now →",
      link: `/portal/${studioSlug}/invoices/202`,
      color: "red"
    },
    {
      id: "proposal",
      title: "Proposal Review",
      desc: "Review your detailed proposal package for the Grand Reception",
      icon: FileText,
      cta: "View proposal →",
      link: `/portal/${studioSlug}/proposals/303`,
      color: "amber"
    },
    {
      id: "gallery",
      title: "Photo Selection",
      desc: "Select 40 favourite photos from your Haldi Ceremony",
      icon: ImageIcon,
      cta: "View gallery →",
      link: `/gallery/p/priya-haldi?mode=select`,
      color: "emerald"
    }
  ]

  if (actions.length === 0) {
    return (
      <div className="w-full bg-card border border-border/40 rounded-xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
           <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-base font-semibold text-foreground">You're all caught up!</h3>
        <p className="text-sm text-muted-foreground mt-1">There are no pending actions mapping to your account currently.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {actions.map(action => {
        const Icon = action.icon
        // Color mapping structural isolation array safely executing visual boundaries natively.
        const colorClass = 
          action.color === 'blue' ? 'text-blue-600 bg-blue-500/10 border-blue-500/20' :
          action.color === 'red' ? 'text-red-600 bg-red-500/10 border-red-500/20' :
          action.color === 'emerald' ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' :
          'text-amber-600 bg-amber-500/10 border-amber-500/20'

        return (
          <Link href={action.link} key={action.id} className="block transition-transform hover:-translate-y-0.5 active:translate-y-0">
            <div className={`w-full bg-card border border-border/50 rounded-xl p-4 sm:p-5 flex items-start gap-4 shadow-sm relative overflow-hidden group`}>
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--portal-primary))] opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className={`w-10 h-10 rounded-full flex shrink-0 items-center justify-center border ${colorClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 pt-0.5 min-w-0">
                <h4 className="text-[15px] font-semibold text-foreground tracking-tight">{action.title}</h4>
                <p className="text-sm text-muted-foreground mt-0.5 truncate pr-4">{action.desc}</p>
                <div className="mt-2.5 inline-flex items-center text-sm font-semibold text-[hsl(var(--portal-primary))] hover:brightness-110">
                  {action.cta}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
