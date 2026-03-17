"use client";

import { useState } from "react";
import { 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  MessageCircle, 
  Mail, 
  QrCode,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useInvoice } from "@/hooks/use-invoice";

interface PaymentLinkCardProps {
  invoice: any;
  onRefresh?: () => void;
}

export function PaymentLinkCard({ invoice, onRefresh }: PaymentLinkCardProps) {
  const { copyPaymentLink, regenerateLink, isLoading } = useInvoice();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (invoice.razorpay_link_url) {
      copyPaymentLink(invoice.razorpay_link_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = async () => {
    await regenerateLink(invoice.id);
    onRefresh?.();
  };

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-8">
        <div className="flex justify-between items-start">
           <CardTitle className="text-xl font-black tracking-tight">Razorpay Link</CardTitle>
           <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-black text-[9px] uppercase tracking-widest">Active</Badge>
        </div>
        <CardDescription className="text-slate-400 font-medium">Clients can pay securely via UPI, Card, or Net Banking using this link.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
         <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group">
               <code className="text-[10px] font-mono font-bold text-slate-500 truncate mr-4">
                 {invoice.razorpay_link_url || 'https://rzp.io/l/sd_p_xxxxxxx'}
               </code>
               <Button 
                 variant="secondary" 
                 size="sm" 
                 onClick={handleCopy}
                 className="h-8 rounded-lg font-bold text-[10px] uppercase tracking-widest shrink-0"
               >
                 {copied ? <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Link</>}
               </Button>
            </div>
            
            <div className="flex gap-2">
               <Button variant="outline" className="flex-1 h-11 rounded-xl border-slate-200 text-xs font-bold" asChild>
                  <a href={invoice.razorpay_link_url} target="_blank" rel="noopener noreferrer">
                     <ExternalLink className="w-4 h-4 mr-2" /> Open Link
                  </a>
               </Button>
               <Button 
                 variant="outline" 
                 className="flex-1 h-11 rounded-xl border-slate-200 text-xs font-bold"
                 onClick={handleRegenerate}
                 disabled={isLoading}
               >
                  <RefreshCw className={isLoading ? "w-4 h-4 mr-2 animate-spin" : "w-4 h-4 mr-2"} /> Regenerate
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-8 items-center pt-8 border-t border-slate-50">
            <div className="space-y-4">
               <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Quick Share</h4>
               <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="w-10 h-10 rounded-xl border-slate-100 shadow-sm text-emerald-500 hover:bg-emerald-50">
                     <MessageCircle className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="w-10 h-10 rounded-xl border-slate-100 shadow-sm text-blue-500 hover:bg-blue-50">
                     <Mail className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="outline" className="w-10 h-10 rounded-xl border-slate-100 shadow-sm text-slate-500 hover:bg-slate-50">
                     <Download className="w-5 h-5" />
                  </Button>
               </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
               <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2">
                  <QrCode className="w-full h-full text-slate-300" />
               </div>
               <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Scan to Pay</span>
            </div>
         </div>
      </CardContent>
    </Card>
  );
}
