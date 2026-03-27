"use client"

import { Zap, Banknote, Landmark, FileText, CreditCard } from "lucide-react"

export type PaymentMethodType = "UPI" | "Cash" | "Bank Transfer" | "Cheque" | "Card"

export function PaymentMethodBadge({ method }: { method: PaymentMethodType | string }) {
  
  switch (method) {
    case "UPI":
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted text-foreground border border-primary/20 w-fit">
          <Zap className="w-3 h-3" />
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase">UPI</span>
        </div>
      )
    case "Cash":
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted text-foreground border border-border/60 w-fit">
          <Banknote className="w-3 h-3" />
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase">CASH</span>
        </div>
      )
    case "Bank Transfer":
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted text-foreground border border-primary/40 w-fit">
          <Landmark className="w-3 h-3" />
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase">NEFT/RTGS</span>
        </div>
      )
    case "Cheque":
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted text-foreground border border-primary/30 w-fit">
          <FileText className="w-3 h-3" />
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase">CHEQUE</span>
        </div>
      )
    case "Card":
    default:
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted text-foreground border border-border/40 w-fit">
          <CreditCard className="w-3 h-3" />
          <span className="text-[9px] font-mono font-bold tracking-widest uppercase">{method}</span>
        </div>
      )
  }
}
