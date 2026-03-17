"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  FileText, 
  Activity,
  User,
  MapPin,
  CheckCircle2,
  Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RazorpayButton } from "@/components/invoices/RazorpayButton";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { PaymentReceiptCard } from "@/components/payments/PaymentReceiptCard";
import { formatINR } from "@/lib/formatters";
import { cn } from "@/lib/utils";

async function getInvoiceByToken(token: string) {
  // Mock fetching invoice by public token
  return {
    id: "INV-123",
    invoice_number: "SD-FY2526-0001",
    status: "sent",
    type: "advance",
    amount_due: 59000,
    total_amount: 59000,
    subtotal: 50000,
    gst_total: 9000,
    gst_type: "cgst_sgst",
    issue_date: "15 Mar 2025",
    due_date: "22 Mar 2025",
    items: [
      { id: "1", description: "Premium Wedding Photography Advance (30%)", quantity: 1, rate: 50000, amount: 50000 }
    ],
    client: { 
      full_name: "Priya Sharma", 
      email: "priya@example.com", 
      phone: "+91 98765 43210",
      address: "Bandra, Mumbai" 
    },
    booking: { title: "Priya & Rahul Wedding", event_date: "15 June 2025" }
  };
}

const studio = {
  name: "Pixel Perfection Studios",
  address: "Bangalore, KA",
  gstin: "29AAAAA0000A1Z5",
  logo_url: "https://studiodesk.io/logo.png",
  brand_color: "#1A3C5E",
  bank_name: "HDFC Bank",
  bank_account: "XXXX6789",
  bank_ifsc: "HDFC0001234"
};

export default function PublicInvoicePage({ params }: { params: { token: string } }) {
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  useEffect(() => {
    getInvoiceByToken(params.token).then(data => {
      setInvoice(data);
      setIsLoading(false);
    });
  }, [params.token]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
         <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!invoice) notFound();

  if (paymentSuccess) {
    return <PaymentReceiptCard payment={paymentSuccess} invoice={invoice} studio={studio} />;
  }

  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      
      {/* Left: Summary & Payment Box */}
      <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 order-1 lg:order-1">
         <Card className="border-none shadow-2xl shadow-primary/5 rounded-[40px] overflow-hidden bg-white border-2 border-slate-50">
            <div className="p-10 space-y-8">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount to Pay</p>
                     <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{formatINR(invoice.amount_due)}</h2>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-3 border-none",
                        isOverdue ? "bg-rose-500 text-white" : "bg-amber-100 text-amber-600"
                     )}>
                        {isOverdue ? 'Overdue' : 'Due Soon'}
                     </Badge>
                     <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                        <Clock className="w-2.5 h-2.5" /> Due by {invoice.due_date}
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                     <span>Booking Ref</span>
                     <span className="text-slate-900 font-black">{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                     <span>Client</span>
                     <span className="text-slate-900 font-black">{invoice.client.full_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                     <span>Invoice Type</span>
                     <span className="text-slate-900 font-black capitalize">{invoice.type}</span>
                  </div>
               </div>

               <Separator className="bg-slate-100" />

               <div className="space-y-6">
                  <RazorpayButton 
                    invoice={invoice} 
                    studio={studio} 
                    onSuccess={(res) => setPaymentSuccess(res)} 
                  />
                  
                  <div className="flex justify-center gap-8 grayscale opacity-40">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" alt="Visa" className="h-4" />
                     <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3" />
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-50 p-6 flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-primary">
                  <Activity className="w-5 h-5" />
               </div>
               <div className="flex-1">
                  <h4 className="text-[10px] font-black uppercase text-slate-900 tracking-widest">Payment Security</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Your data is encrypted and handled by Razorpay.</p>
               </div>
            </div>
         </Card>

         <div className="space-y-4 px-6 md:px-0">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Merchant Info</h4>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0">
                  {studio.name.charAt(0)}
               </div>
               <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900">{studio.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                     <MapPin className="w-3 h-3" /> {studio.address}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Right: Detailed Invoice View */}
      <div className="lg:col-span-7 order-2 lg:order-2">
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Full Invoice Details
               </h3>
               <Button variant="ghost" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
                  <Download className="w-3.5 h-3.5 mr-2" /> Download PDF
               </Button>
            </div>
            <div className="scale-[0.9] origin-top md:scale-100">
               <InvoiceDocument invoice={invoice} studio={studio} />
            </div>
         </div>
      </div>

    </div>
  );
}
