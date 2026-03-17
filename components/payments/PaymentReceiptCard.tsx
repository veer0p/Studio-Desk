"use client";

import { 
  CheckCircle2, 
  IndianRupee, 
  Download, 
  ArrowRight,
  Share2,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, formatIndianDateTime } from "@/lib/formatters";

interface PaymentReceiptCardProps {
  payment: any;
  invoice: any;
  studio: any;
}

export function PaymentReceiptCard({ payment, invoice, studio }: PaymentReceiptCardProps) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 border border-slate-100 max-w-lg mx-auto animate-in zoom-in-95 duration-500">
      <div className="bg-emerald-500 p-12 text-center text-white space-y-4 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
         <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-2xl" />
         
         <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-900/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
         </div>
         <h1 className="text-3xl font-black tracking-tight">Payment Successful</h1>
         <p className="text-emerald-100 font-medium opacity-90">Thank you! Your payment has been received and verified.</p>
      </div>

      <div className="p-10 space-y-8">
         <div className="grid grid-cols-2 gap-8 items-center">
            <div className="space-y-1">
               <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Transaction ID</div>
               <div className="text-sm font-mono font-bold text-slate-900">{payment.razorpay_payment_id || payment.id}</div>
            </div>
            <div className="text-right space-y-1">
               <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date & Time</div>
               <div className="text-sm font-bold text-slate-900">{formatIndianDateTime(new Date())}</div>
            </div>
         </div>

         <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Invoice Paid</span>
               <span className="text-xs font-mono font-black text-slate-900">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
               <span className="text-lg font-black text-slate-900 tracking-tighter">Amount Paid</span>
               <span className="text-3xl font-black text-emerald-600 tracking-tighter">{formatINR(payment.amount / 100 || payment.amount)}</span>
            </div>
         </div>

         <div className="space-y-3 pt-4">
            <Button className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98]">
               <Download className="w-4 h-4 mr-2" /> Download Receipt
            </Button>
            <div className="grid grid-cols-2 gap-3">
               <Button variant="outline" className="h-12 rounded-xl border-slate-200 font-bold" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" /> Print
               </Button>
               <Button variant="outline" className="h-12 rounded-xl border-slate-200 font-bold">
                  <Share2 className="w-4 h-4 mr-2" /> Share
               </Button>
            </div>
         </div>

         <p className="text-[10px] text-center text-slate-300 font-bold uppercase tracking-[0.2em] pt-8">
            Powering {studio.name} via StudioDesk
         </p>
      </div>
    </div>
  );
}
