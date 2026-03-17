"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Download,
  Eye,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ContractStatusBannerProps {
  contract: any;
  client: any;
}

export function ContractStatusBanner({ contract, client }: ContractStatusBannerProps) {
  const status = contract.status; // draft, sent, signed, cancelled
  
  const copyLink = () => {
    navigator.clipboard.writeText(`https://studiodesk.io/contract/${contract.id}`);
    toast.success("Signing link copied to clipboard");
  };

  if (status === "signed") {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 -mr-16 -mt-16 rounded-full blur-2xl" />
         <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200/50">
               <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-emerald-900">Contract Signed</h3>
               <p className="text-sm text-emerald-700/80 font-medium">Agreement executed by {client.full_name} on {format(new Date(contract.signed_at || Date.now()), "MMMM d, yyyy")}.</p>
            </div>
         </div>
         <div className="flex gap-3 z-10">
            <Button variant="outline" size="sm" className="bg-white border-emerald-200 text-emerald-900 hover:bg-emerald-50 h-10 px-6 font-bold">
               <Download className="w-4 h-4 mr-2" /> Download Signed PDF
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-10 px-6 font-bold">
               Create Advance Invoice
            </Button>
         </div>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm overflow-hidden relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 -mr-16 -mt-16 rounded-full blur-2xl" />
         <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200/50">
               <Clock className="w-7 h-7" />
            </div>
            <div>
               <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-amber-900">Awaiting Signature</h3>
                  <Badge className="bg-amber-500/10 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest">Client Portal Active</Badge>
               </div>
               <div className="flex items-center gap-4 mt-1">
                  <p className="text-[11px] text-amber-700 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                     <Send className="w-3 h-3" /> Sent: {format(new Date(contract.created_at), "MMM d, h:mm a")}
                  </p>
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                     <Eye className="w-3 h-3" /> {contract.viewed_at ? `Viewed: ${format(new Date(contract.viewed_at), "MMM d, h:mm a")}` : "Not yet viewed"}
                  </p>
               </div>
            </div>
         </div>
         <div className="flex gap-3 z-10">
            <Button variant="outline" size="sm" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-50 h-10 px-6 font-bold" onClick={copyLink}>
               <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
            <Button variant="outline" size="sm" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-50 h-10 px-6 font-bold">
               <ExternalLink className="w-4 h-4 mr-2" /> Preview Portal
            </Button>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-10 px-6 font-bold text-white border-none">
               Send Reminder
            </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
       <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-slate-400 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
             <AlertCircle className="w-7 h-7" />
          </div>
          <div>
             <h3 className="text-xl font-bold text-slate-900">Draft Contract</h3>
             <p className="text-sm text-slate-500 font-medium">This agreement is currently in draft mode and hasn&apos;t been shared.</p>
          </div>
       </div>
       <div className="flex gap-3">
          <Button variant="outline" size="sm" className="h-10 px-6 font-bold hover:bg-white" asChild>
             <Link href={`/${contract.id}/edit`}>Continue Editing</Link>
          </Button>
          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 h-10 px-8 font-bold text-white">
             Confirm & Send for Signature
          </Button>
       </div>
    </div>
  );
}
