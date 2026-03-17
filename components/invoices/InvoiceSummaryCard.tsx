"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { Invoice } from "@/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface InvoiceSummaryCardProps {
  type: 'advance' | 'balance';
  invoice?: Invoice;
  bookingId: string;
}

export function InvoiceSummaryCard({ type, invoice, bookingId }: InvoiceSummaryCardProps) {
  const isAdvance = type === 'advance';
  
  if (!invoice) {
    return (
      <Card className="border-2 border-dashed border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-slate-200 transition-all group rounded-3xl cursor-pointer">
        <Link href={`/invoices/new?booking_id=${bookingId}&type=${type}`} className="w-full">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/20 group-hover:shadow-lg transition-all">
               <Plus className="w-6 h-6" />
            </div>
            <div>
               <h4 className="font-bold text-slate-400 group-hover:text-slate-900 capitalize">Create {type} Invoice</h4>
               <p className="text-[10px] uppercase font-black tracking-widest text-slate-300 mt-1">Pending Generation</p>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden group">
      <CardContent className="p-0">
        <div className={cn(
          "p-6 flex items-start justify-between border-b",
          isPaid ? "bg-emerald-50/50" : isOverdue ? "bg-rose-50/50" : "bg-white"
        )}>
           <div className="flex gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                isPaid ? "bg-emerald-100 text-emerald-600" : isOverdue ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-400"
              )}>
                 {isPaid ? <CheckCircle2 className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">{invoice.invoice_number}</span>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-slate-200">
                      {invoice.type.replace('_', ' ')}
                    </Badge>
                 </div>
                 <div className="text-lg font-black text-slate-900">{formatINR(invoice.total_amount)}</div>
              </div>
           </div>
           {isOverdue && <Badge className="bg-rose-500 text-white border-none font-black text-[9px] uppercase">Overdue</Badge>}
           {isPaid && <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase">Paid</Badge>}
        </div>

        <div className="p-6 space-y-4">
           {!isPaid && (
             <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">Due Date</span>
                <span className={isOverdue ? "text-rose-600" : "text-slate-900"}>{invoice.due_date}</span>
             </div>
           )}
           <Button variant="outline" className="w-full h-10 rounded-xl font-bold text-xs uppercase tracking-widest group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm" asChild>
              <Link href={`/invoices/${invoice.id}`}>
                 View Invoice <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>
           </Button>
        </div>
      </CardContent>
    </Card>
  );
}
