"use client";

import { Progress } from "@/components/ui/progress";
import { formatINR } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface InvoiceStatusProgressProps {
  amountPaid: number;
  totalAmount: number;
  isAdvance?: boolean;
  advanceAmount?: number;
}

export function InvoiceStatusProgress({ 
  amountPaid, 
  totalAmount, 
  isAdvance,
  advanceAmount 
}: InvoiceStatusProgressProps) {
  const percentage = Math.min(100, Math.round((amountPaid / totalAmount) * 100));
  const amountOutstanding = totalAmount - amountPaid;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div className="space-y-0.5">
           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paid</div>
           <div className="text-sm font-bold text-emerald-600">{formatINR(amountPaid)}</div>
        </div>
        <div className="text-right space-y-0.5">
           <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Outstanding</div>
           <div className="text-sm font-bold text-rose-600">{formatINR(amountOutstanding)}</div>
        </div>
      </div>

      <div className="relative">
         <Progress value={percentage} className="h-2.5 bg-slate-100" />
         {isAdvance && advanceAmount && (
           <div 
             className="absolute top-0 h-2.5 border-r-2 border-slate-900 z-10" 
             style={{ left: `${(advanceAmount / totalAmount) * 100}%` }}
           />
         )}
      </div>

      <div className="flex justify-between items-center">
         <div className="text-[10px] font-bold text-slate-500 uppercase">
            {percentage}% Collected
         </div>
         {isAdvance && (
            <div className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">
               Advance Milestone: {formatINR(advanceAmount || 0)}
            </div>
         )}
      </div>
    </div>
  );
}
