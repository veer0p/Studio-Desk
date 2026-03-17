"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Send, 
  Mail, 
  MessageCircle, 
  Check, 
  Smartphone,
  Globe,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useInvoice } from "@/hooks/use-invoice";

export default function SendInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { sendInvoice, isLoading } = useInvoice();

  const [channels, setChannels] = useState({
    email: true,
    whatsapp: true,
  });

  const handleSend = async () => {
    const success = await sendInvoice(params.id, channels);
    if (success) {
      router.push(`/invoices/${params.id}`);
    }
  };

  const invoice = {
    invoice_number: "SD-FY2526-0001",
    client_name: "Priya Sharma",
    client_email: "priya@example.com",
    client_phone: "+91 98765 43210"
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-12">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full shadow-sm" asChild>
          <Link href={`/invoices/${params.id}`}>
             <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Send Invoice</h1>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden p-12 space-y-10">
         <div className="space-y-2 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
               <Send className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold">Ready to notify your client?</h2>
            <p className="text-slate-500 font-medium">We will send a beautifully branded notification with the payment link.</p>
         </div>

         <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Select Channels</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div 
                 className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4 ${channels.email ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                 onClick={() => setChannels(c => ({ ...c, email: !c.email }))}
               >
                  <div className="flex justify-between items-start">
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${channels.email ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Mail className="w-5 h-5" />
                     </div>
                     <Checkbox checked={channels.email} className="rounded-full border-2" />
                  </div>
                  <div>
                     <div className="font-bold text-slate-900">Email Only</div>
                     <p className="text-[10px] text-slate-500 font-medium">{invoice.client_email}</p>
                  </div>
               </div>

               <div 
                 className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-4 ${channels.whatsapp ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                 onClick={() => setChannels(c => ({ ...c, whatsapp: !c.whatsapp }))}
               >
                  <div className="flex justify-between items-start">
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${channels.whatsapp ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <MessageCircle className="w-5 h-5" />
                     </div>
                     <Checkbox checked={channels.whatsapp} className="rounded-full border-2 border-emerald-500 text-white" />
                  </div>
                  <div>
                     <div className="font-bold text-slate-900">WhatsApp</div>
                     <p className="text-[10px] text-slate-500 font-medium">{invoice.client_phone}</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-slate-50 p-6 rounded-3xl space-y-2">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
               <Smartphone className="w-3.5 h-3.5" /> What the client sees
            </h4>
            <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
               &ldquo;Hey Priya Sharma, your invoice SD-FY2526-0001 from Pixel Perfection Studios is ready. View and pay securely here: https://studiodesk.io/pay/xxxx&rdquo;
            </p>
         </div>

         <Button 
           className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-[0.98]"
           onClick={handleSend}
           disabled={isLoading || (!channels.email && !channels.whatsapp)}
         >
            {isLoading ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Sending...</> : <><Send className="w-5 h-5 mr-3" /> Send Notification Now</>}
         </Button>

         <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            Logged to Audit History
         </p>
      </Card>
    </div>
  );
}
