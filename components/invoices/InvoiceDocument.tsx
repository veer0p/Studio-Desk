"use client";

import { formatINR } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface InvoiceDocumentProps {
  invoice: any;
  studio: any;
  mode?: 'screen' | 'print';
}

export function InvoiceDocument({ invoice, studio, mode = 'screen' }: InvoiceDocumentProps) {
  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';

  return (
    <div className={cn(
      "bg-white relative",
      mode === 'screen' ? "shadow-2xl shadow-slate-200/50 rounded-3xl p-8 md:p-12 border border-slate-100" : "p-0"
    )}>
      {/* Paid Stamp Overlay */}
      {isPaid && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none opacity-20">
           <div className="border-[12px] border-emerald-500 text-emerald-500 px-12 py-4 rounded-3xl font-black text-7xl uppercase tracking-tighter -rotate-12 select-none border-double">
              PAID
           </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
         <div className="space-y-6">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black">
               {studio.name.charAt(0)}
            </div>
            <div className="space-y-1">
               <h2 className="text-xl font-bold text-slate-900">{studio.name}</h2>
               <p className="text-sm text-slate-500 whitespace-pre-wrap max-w-sm">{studio.address}</p>
               <p className="text-sm font-bold text-slate-900">GSTIN: {studio.gstin}</p>
            </div>
         </div>
         <div className="text-left md:text-right space-y-4">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Tax Invoice</h1>
            <div className="space-y-1">
               <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Invoice Number</div>
               <div className="text-lg font-mono font-bold text-slate-900">{invoice.invoice_number}</div>
            </div>
            <div className="grid grid-cols-2 gap-8 pt-4">
               <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</div>
                  <div className="text-sm font-bold text-slate-900">{invoice.issue_date}</div>
               </div>
               <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Due Date</div>
                  <div className="text-sm font-bold text-rose-600">{invoice.due_date}</div>
               </div>
            </div>
         </div>
      </div>

      {/* Bill To Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
         <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Bill To</h3>
            <div className="space-y-1">
               <div className="text-lg font-bold text-slate-900">{invoice.client?.full_name}</div>
               <p className="text-sm text-slate-500 whitespace-pre-wrap">{invoice.client?.address}</p>
               {invoice.client?.gstin && <p className="text-sm font-bold text-slate-900 mt-2">GSTIN: {invoice.client.gstin}</p>}
            </div>
         </div>
         <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Project Information</h3>
            <div className="space-y-3">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Booking Title</span>
                  <span className="font-bold text-slate-900">{invoice.booking?.title}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Event Date</span>
                  <span className="font-bold text-slate-900">{invoice.booking?.event_date}</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Invoice Type</span>
                  <Badge variant="secondary" className="bg-white border-slate-200 capitalize text-[10px] h-5 font-bold">{invoice.type.replace('_', ' ')}</Badge>
               </div>
            </div>
         </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
         <table className="w-full">
            <thead>
               <tr className="border-b-2 border-slate-900">
                  <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                  <th className="py-4 px-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">HSN/SAC</th>
                  <th className="py-4 px-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 w-20">Qty</th>
                  <th className="py-4 px-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Rate</th>
                  <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {invoice.items.map((item: any) => (
                 <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 align-top">
                       <div className="font-bold text-slate-900">{item.description}</div>
                    </td>
                    <td className="py-6 px-4 text-center align-top text-xs font-mono text-slate-500">{item.hsn_sac || '-'}</td>
                    <td className="py-6 px-4 text-center align-top text-sm font-medium">{item.quantity}</td>
                    <td className="py-6 px-4 text-right align-top text-sm font-medium">{formatINR(item.rate)}</td>
                    <td className="py-6 text-right align-top font-black text-slate-900">{formatINR(item.amount)}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Footer / Taxes */}
      <div className="mt-12 flex flex-col md:grid md:grid-cols-2 gap-12 pt-12 border-t border-slate-900 border-dashed">
         <div className="space-y-8">
            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">GST Breakdown</h3>
               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
                  {invoice.gst_type === 'cgst_sgst' ? (
                     <>
                        <div className="flex justify-between text-xs">
                           <span className="text-slate-500 font-medium">CGS @ 9%</span>
                           <span className="font-bold">{formatINR(invoice.gst_total / 2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-slate-500 font-medium">SGST @ 9%</span>
                           <span className="font-bold">{formatINR(invoice.gst_total / 2)}</span>
                        </div>
                     </>
                  ) : invoice.gst_type === 'igst' ? (
                     <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">IGST @ 18%</span>
                        <span className="font-bold">{formatINR(invoice.gst_total)}</span>
                     </div>
                  ) : (
                     <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">GST</span>
                        <Badge variant="outline" className="h-5 text-[9px] font-black">EXEMPT</Badge>
                     </div>
                  )}
               </div>
            </div>

            <div className="space-y-2">
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount in Words</div>
               <div className="text-xs font-bold italic text-slate-600 leading-relaxed uppercase tracking-tight">
                  Rupees Fifty Nine Thousand Only
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="space-y-3">
               <div className="flex justify-between items-center text-sm font-medium text-slate-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{formatINR(invoice.subtotal)}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-medium text-slate-500 uppercase tracking-widest">
                  <span>GST Total</span>
                  <span>{formatINR(invoice.gst_total)}</span>
               </div>
               <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-900">
                  <span className="text-xl font-black text-slate-900 uppercase tracking-tighter">Grand Total</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tighter">{formatINR(invoice.total_amount)}</span>
               </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-xl shadow-slate-200">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bank Transfer Details</h3>
               <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                     <span className="text-slate-400 uppercase tracking-widest">Bank Name</span>
                     <span className="font-bold">{studio.bank_name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-slate-400 uppercase tracking-widest">Account</span>
                     <span className="font-mono font-bold tracking-widest">{studio.bank_account}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-slate-400 uppercase tracking-widest">IFSC Code</span>
                     <span className="font-mono font-bold">{studio.bank_ifsc}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Terms */}
      <div className="mt-16 pt-12 border-t border-slate-100 space-y-8">
         {invoice.notes && (
           <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes & Terms</h4>
              <p className="text-xs text-slate-500 leading-relaxed italic">&ldquo;{invoice.notes}&rdquo;</p>
           </div>
         )}
         <div className="text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Computer Generated Invoice — No Signature Required</p>
         </div>
      </div>
    </div>
  );
}
