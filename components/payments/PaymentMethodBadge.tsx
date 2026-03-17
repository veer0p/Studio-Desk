"use client";

import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Coins, 
  Wallet,
  Globe
} from "lucide-react";

interface PaymentMethodBadgeProps {
  method: string;
  showIcon?: boolean;
}

const methodConfigs: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  upi: { label: "UPI", icon: Smartphone, color: "text-emerald-600", bg: "bg-emerald-50" },
  card: { label: "Card", icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
  net_banking: { label: "Net Banking", icon: Building2, color: "text-amber-600", bg: "bg-amber-50" },
  cash: { label: "Cash", icon: Coins, color: "text-slate-900", bg: "bg-slate-50" },
  neft: { label: "NEFT/RTGS", icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
  cheque: { label: "Cheque", icon: Coins, color: "text-indigo-600", bg: "bg-indigo-50" },
  other: { label: "Other", icon: Globe, color: "text-slate-400", bg: "bg-slate-50" }
};

export function PaymentMethodBadge({ method, showIcon = true }: PaymentMethodBadgeProps) {
  const config = methodConfigs[method.toLowerCase()] || methodConfigs.other;
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none",
      config.bg,
      config.color
    )}>
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </div>
  );
}
