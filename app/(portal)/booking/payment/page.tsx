"use client";

import { usePortalSession } from "@/lib/portal/session";
import { SessionExpiredScreen } from "@/components/portal/SessionExpiredScreen";
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Clock, 
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/button"; // Standard Card would be better
import Link from "next/link";
import { cn } from "@/lib/utils";

const invoices = [
  { id: "inv-1", number: "INV-25-001", type: "Advance Payment", amount: 45000, status: "paid", dueDate: "Oct 15, 2025" },
  { id: "inv-2", number: "INV-25-042", type: "Balance Payment", amount: 79500, status: "pending", dueDate: "Dec 18, 2025" }
];

export default function PortalPaymentPage() {
  const { session, isLoading, isValid } = usePortalSession();

  if (isLoading) return null;
  if (!isValid) return <SessionExpiredScreen studio={session?.studio} />;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50" asChild>
            <Link href="/booking">
               <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Link>
         </Button>
         <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Payments & Invoices</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Overview</p>
         </div>
      </div>

      {/* Summary Stat */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex justify-between items-center shadow-2xl shadow-slate-200">
         <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Amount Remaining</p>
            <h2 className="text-4xl font-black tracking-tighter text-emerald-400">₹79,500</h2>
         </div>
         <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white/40">
            <CreditCard className="w-8 h-8" />
         </div>
      </div>

      <div className="space-y-6">
         <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Pending Invoices</h3>
         
         {invoices.filter(i => i.status === 'pending').map(inv => (
           <div key={inv.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 space-y-6">
                 <div className="flex justify-between items-start">
                    <div className="space-y-1">
                       <Badge className="bg-amber-50 text-amber-600 border-none px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">Pending</Badge>
                       <h4 className="text-lg font-black text-slate-900">{inv.type}</h4>
                       <p className="text-[10px] font-bold text-slate-400">{inv.number} • Due {inv.dueDate}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-slate-900">₹{inv.amount.toLocaleString('en-IN')}</p>
                    </div>
                 </div>

                 <Button className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-100 font-black text-xs uppercase tracking-widest gap-2">
                    Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>

                 <div className="flex items-center gap-2 justify-center pt-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Secure Razorpay Checkout</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="space-y-6">
         <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Payment History</h3>
         
         <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 divide-y divide-slate-100">
            {invoices.filter(i => i.status === 'paid').map(inv => (
              <div key={inv.id} className="p-6 flex items-center justify-between group">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                       <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-xs font-black text-slate-900">{inv.type}</h4>
                       <p className="text-[10px] font-bold text-slate-400">Captured • Oct 10, 2025</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="text-right mr-2">
                       <p className="text-[11px] font-black text-slate-900">₹{inv.amount.toLocaleString('en-IN')}</p>
                       <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">Google Pay</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-sm">
                       <Download className="w-4 h-4 text-slate-400" />
                    </Button>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div className="bg-slate-50 rounded-3xl p-6 flex gap-4 border border-dashed border-slate-200">
         <AlertCircle className="w-6 h-6 text-slate-300 shrink-0" />
         <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
            Download access to your photo gallery is automatically granted once all pending invoices are settled. Please contact your studio for any billing discrepancies.
         </p>
      </div>
    </div>
  );
}
