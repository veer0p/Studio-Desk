"use client";

import { formatINR } from "@/lib/formatters";
import { Invoice, StudioContext } from "@/types";
import { cn } from "@/lib/utils";

interface GSTPrintProps {
  invoice: any;
  studio: any;
}

export function GSTPrint({ invoice, studio }: GSTPrintProps) {
  return (
    <div className="hidden print:block print:w-full print:p-0 print:m-0 bg-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 1.5cm; }
          body { -webkit-print-color-adjust: exact; }
          .print-border { border: 1.5px solid #000 !important; }
          .print-border-b { border-bottom: 1.5px solid #000 !important; }
          .print-border-r { border-right: 1.5px solid #000 !important; }
          .print-bg-gray { background-color: #f3f4f6 !important; }
        }
      `}} />

      <div className="print-border p-8 min-h-[297mm] flex flex-col">
        {/* Letterhead */}
        <div className="flex justify-between items-start mb-8">
           <div className="space-y-4">
              <div className="text-3xl font-black uppercase tracking-tighter">TAX INVOICE</div>
              <div className="space-y-1">
                 <h2 className="text-xl font-bold">{studio.name}</h2>
                 <p className="text-sm whitespace-pre-wrap max-w-sm">{studio.address}</p>
                 <p className="text-sm font-bold">GSTIN: {studio.gstin}</p>
              </div>
           </div>
           <div className="text-right space-y-1">
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Invoice No.</div>
              <div className="text-lg font-mono font-bold">{invoice.invoice_number}</div>
              <div className="pt-4">
                 <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Date</div>
                 <div className="text-sm font-bold">{invoice.issue_date}</div>
              </div>
           </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-12">
           <div className="print-border p-6 rounded-lg">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Bill To</div>
              <div className="space-y-1">
                 <div className="text-lg font-bold">{invoice.client?.full_name}</div>
                 <p className="text-sm whitespace-pre-wrap">{invoice.client?.address}</p>
                 {invoice.client?.gstin && <p className="text-sm font-bold mt-2">GSTIN: {invoice.client.gstin}</p>}
              </div>
           </div>
           <div className="print-border p-6 rounded-lg">
              <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Booking & Payment</div>
              <div className="space-y-2">
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Booking Ref</span>
                    <span className="font-bold">{invoice.booking?.title}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Due Date</span>
                    <span className="font-bold text-rose-600">{invoice.due_date}</span>
                 </div>
                 <div className="flex justify-between text-sm capitalize">
                    <span className="text-slate-500">Invoice Type</span>
                    <span className="font-bold">{invoice.type.replace('_', ' ')}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
           <thead>
              <tr className="print-border-b print-bg-gray">
                 <th className="py-3 px-4 text-left text-xs font-black uppercase tracking-widest">Description</th>
                 <th className="py-3 px-4 text-center text-xs font-black uppercase tracking-widest w-24">HSN</th>
                 <th className="py-3 px-4 text-center text-xs font-black uppercase tracking-widest w-20">Qty</th>
                 <th className="py-3 px-4 text-right text-xs font-black uppercase tracking-widest w-32">Rate</th>
                 <th className="py-3 px-4 text-right text-xs font-black uppercase tracking-widest w-32">Amount</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item: any) => (
                <tr key={item.id}>
                   <td className="py-4 px-4 align-top">
                      <div className="font-bold">{item.description}</div>
                   </td>
                   <td className="py-4 px-4 text-center text-sm font-mono">{item.hsn_sac || '-'}</td>
                   <td className="py-4 px-4 text-center text-sm">{item.quantity}</td>
                   <td className="py-4 px-4 text-right text-sm">{formatINR(item.rate)}</td>
                   <td className="py-4 px-4 text-right font-bold text-sm tracking-tight">{formatINR(item.amount)}</td>
                </tr>
              ))}
           </tbody>
        </table>

        {/* GST Breakdown & Totals */}
        <div className="mt-auto grid grid-cols-2 gap-12 pt-12 border-t font-medium">
           <div>
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">GST Summary</div>
              <table className="w-full text-xs">
                 <tbody className="divide-y divide-slate-100">
                    {invoice.gst_type === 'cgst_sgst' ? (
                       <>
                        <tr className="py-2">
                           <td className="py-2">CGST @ 9%</td>
                           <td className="text-right py-2 font-bold">{formatINR(invoice.gst_total / 2)}</td>
                        </tr>
                        <tr className="py-2">
                           <td className="py-2">SGST @ 9%</td>
                           <td className="text-right py-2 font-bold">{formatINR(invoice.gst_total / 2)}</td>
                        </tr>
                       </>
                    ) : invoice.gst_type === 'igst' ? (
                       <tr>
                          <td className="py-2">IGST @ 18%</td>
                          <td className="text-right py-2 font-bold">{formatINR(invoice.gst_total)}</td>
                       </tr>
                    ) : (
                       <tr>
                          <td className="py-2">GST (Exempt)</td>
                          <td className="text-right py-2 font-bold">{formatINR(0)}</td>
                       </tr>
                    )}
                 </tbody>
              </table>
              <div className="mt-8">
                 <div className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Amount in Words</div>
                 <div className="text-xs font-bold italic text-slate-600">Rupees Fifty Nine Thousand Only</div>
              </div>
           </div>

           <div className="text-right space-y-3">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-bold uppercase tracking-widest">Subtotal</span>
                 <span className="font-bold">{formatINR(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-500 font-bold uppercase tracking-widest">GST Total</span>
                 <span className="font-bold">{formatINR(invoice.gst_total)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
                 <span className="text-lg font-black uppercase tracking-tighter">Grand Total</span>
                 <span className="text-2xl font-black tracking-tighter">{formatINR(invoice.total_amount)}</span>
              </div>
              
              <div className="pt-8 space-y-1">
                 <div className="text-[10px] font-black uppercase text-slate-400">Bank Details</div>
                 <div className="text-xs font-bold">{studio.bank_name}</div>
                 <div className="text-xs font-mono">A/C: {studio.bank_account}</div>
                 <div className="text-xs font-mono">IFSC: {studio.bank_ifsc}</div>
              </div>
           </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-12 text-center border-t pt-6 space-y-4">
           {invoice.status === 'paid' && (
             <div className="inline-block border-4 border-emerald-500 text-emerald-500 px-8 py-2 font-black text-2xl uppercase tracking-tighter -rotate-6">PAID</div>
           )}
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">This is a computer-generated tax invoice and does not require a physical signature.</p>
        </div>
      </div>
    </div>
  );
}
