"use client"

import { Zap, Banknote, Landmark, FileText, CreditCard } from "lucide-react"

export type PaymentMethodType = "UPI" | "Cash" | "Bank Transfer" | "Cheque" | "Card"

export function PaymentMethodBadge({ method }: { method: PaymentMethodType | string }) {
  
  switch (method) {
    case "UPI":
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 border border-violet-500/20 w-fit">
          <Zap className="w-3 h-3" />
          <span className="text-[10px] font-medium tracking-wide">UPI</span>
        </div>
      )
    case "Cash":
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 w-fit">
          <Banknote className="w-3 h-3" />
          <span className="text-[10px] font-medium tracking-wide">CASH</span>
        </div>
      )
    case "Bank Transfer":
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 w-fit">
          <Landmark className="w-3 h-3" />
          <span className="text-[10px] font-medium tracking-wide">NEFT/RTGS</span>
        </div>
      )
    case "Cheque":
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 w-fit">
          <FileText className="w-3 h-3" />
          <span className="text-[10px] font-medium tracking-wide">CHEQUE</span>
        </div>
      )
    case "Card":
    default:
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20 w-fit dark:text-slate-400">
          <CreditCard className="w-3 h-3" />
          <span className="text-[10px] font-medium tracking-wide uppercase">{method}</span>
        </div>
      )
  }
}
