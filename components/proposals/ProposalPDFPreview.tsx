"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download, Printer, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { GSTBreakdown } from "./GSTBreakdown";

interface ProposalPDFPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalData: any;
  studio: any;
  client: any;
}

export function ProposalPDFPreview({ open, onOpenChange, proposalData, studio, client }: ProposalPDFPreviewProps) {
  const [isActualPdf, setIsActualPdf] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 border-b bg-white flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold">Proposal Preview</DialogTitle>
            <DialogDescription>Review how the client will see this proposal.</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button size="sm" className="h-9 bg-primary">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-slate-100/50 p-4 md:p-12">
           <div className="mx-auto max-w-[800px] bg-white shadow-2xl min-h-[1122px] p-12 md:p-16 relative">
              {/* Fallback Watermark */}
              <div className="absolute top-8 right-8 border-2 border-amber-200 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest animate-pulse z-10">
                 <AlertTriangle className="w-3.5 h-3.5" /> Drafting Preview
              </div>

              {/* Studio Branding */}
              <div className="flex justify-between items-start mb-16">
                 <div>
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4">
                      {studio.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{studio.name}</h2>
                    <p className="text-sm text-slate-500 font-medium">{studio.tagline || "Creative Photography Specialists"}</p>
                 </div>
                 <div className="text-right space-y-1">
                    <h1 className="text-4xl font-black text-slate-200 uppercase tracking-tighter mb-4">Proposal</h1>
                    <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Proposal ID: #PRP-{Date.now().toString().slice(-6)}</p>
                    <p className="text-xs text-slate-500">Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                 </div>
              </div>

              {/* Client & Event Info */}
              <div className="grid grid-cols-2 gap-12 mb-16">
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Prepared For</h3>
                    <div>
                       <div className="text-lg font-bold text-slate-900">{client.full_name}</div>
                       <div className="text-sm text-slate-600">{client.email}</div>
                       <div className="text-sm text-slate-600">{client.phone}</div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Event Details</h3>
                    <div className="grid grid-cols-2 gap-y-2">
                       <div className="text-xs font-bold text-slate-400 uppercase">Type:</div>
                       <div className="text-xs font-bold text-slate-900">{proposalData.event_type || client.event_type || "N/A"}</div>
                       <div className="text-xs font-bold text-slate-400 uppercase">Date:</div>
                       <div className="text-xs font-bold text-slate-900">{client.event_date || "To be decided"}</div>
                       <div className="text-xs font-bold text-slate-400 uppercase">Location:</div>
                       <div className="text-xs font-bold text-slate-900">{client.venue || "TBD"}</div>
                    </div>
                 </div>
              </div>

              {/* Line Items */}
              <div className="mb-16">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b-2 border-slate-900">
                          <th className="py-4 text-xs font-black uppercase tracking-widest text-slate-900">Description</th>
                          <th className="py-4 text-xs font-black uppercase tracking-widest text-slate-900 text-center">HSN</th>
                          <th className="py-4 text-xs font-black uppercase tracking-widest text-slate-900 text-center">Qty</th>
                          <th className="py-4 text-xs font-black uppercase tracking-widest text-slate-900 text-right">Unit Price</th>
                          <th className="py-4 text-xs font-black uppercase tracking-widest text-slate-900 text-right">Total</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {proposalData.line_items.map((item: any, i: number) => (
                         <tr key={i} className="group">
                            <td className="py-5">
                               <div className="font-bold text-slate-800">{item.name}</div>
                               <div className="text-xs text-slate-500 mt-1 max-w-sm">{item.description}</div>
                            </td>
                            <td className="py-5 text-center text-[10px] font-mono text-slate-400">{item.hsn}</td>
                            <td className="py-5 text-center font-bold text-slate-700">{item.qty}</td>
                            <td className="py-5 text-right font-medium text-slate-700">₹{(item.unit_price).toLocaleString()}</td>
                            <td className="py-5 text-right font-bold text-slate-900">₹{(item.qty * item.unit_price).toLocaleString()}</td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* Totals & GST */}
              <div className="flex justify-end mb-16">
                 <div className="w-80">
                    <GSTBreakdown 
                      subtotal={proposalData.line_items.reduce((acc: number, item: any) => acc + (item.qty * item.unit_price), 0)}
                      gstType={proposalData.gst_type || "intra"}
                      studioState={studio.state || "Maharashtra"}
                      clientState={client.state}
                    />
                 </div>
              </div>

              {/* Notes */}
              {proposalData.notes && (
                <div className="mb-16 space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Important Notes</h3>
                  <div className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-slate-200 pl-4 py-2 bg-slate-50/50 rounded-r-lg">
                    {proposalData.notes}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="border-t pt-8 mt-auto flex justify-between items-center opacity-40">
                 <div className="text-[10px] font-bold uppercase tracking-widest">Powered by StudioDesk</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase">Page 1 of 1</div>
              </div>
           </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
