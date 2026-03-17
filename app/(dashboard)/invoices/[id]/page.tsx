import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Download, 
  Send, 
  Receipt, 
  ExternalLink,
  MoreVertical,
  History,
  FileCheck,
  CreditCard,
  MessageCircle,
  Mail,
  Printer
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InvoiceDocument } from "@/components/invoices/InvoiceDocument";
import { GSTPrint } from "@/components/invoices/GSTPrint";
import { InvoiceStatusProgress } from "@/components/invoices/InvoiceStatusProgress";
import { PaymentLinkCard } from "@/components/invoices/PaymentLinkCard";
import { formatINR, formatIndianDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";

async function getInvoice(id: string) {
  // Mock invoice data
  return {
    id,
    invoice_number: "SD-FY2526-0001",
    status: "sent",
    type: "advance",
    issue_date: "15 Mar 2025",
    due_date: "22 Mar 2025",
    subtotal: 50000,
    gst_total: 9000,
    total_amount: 59000,
    amount_paid: 0,
    amount_due: 59000,
    gst_type: "cgst_sgst",
    items: [
      { id: "1", description: "Premium Wedding Photography Advance (30%)", quantity: 1, rate: 50000, amount: 50000 }
    ],
    notes: "Please note that the advance amount is non-refundable.",
    razorpay_link_url: "https://rzp.io/l/sd_p_xxxxxxx",
    client: { 
      full_name: "Priya Sharma", 
      email: "priya@example.com", 
      phone: "+91 98765 43210",
      address: "42, Shanti Kunj, Bandra West, Mumbai" 
    },
    booking: { 
      id: "B-1",
      title: "Priya & Rahul Wedding", 
      event_date: "15 June 2025" 
    },
    payments: [
      // { id: "P1", amount: 10000, method: "upi", payment_date: "2024-03-16T14:30:00", reference_number: "RZP_PAY_123" }
    ],
    created_at: "2024-03-15T10:00:00"
  };
}

const studio = {
  name: "Pixel Perfection Studios",
  address: "123, Whitefield Main Road, Bangalore - 560066",
  gstin: "29AAAAA0000A1Z5",
  bank_name: "HDFC Bank",
  bank_account: "XXXX XXXX 1234",
  bank_ifsc: "HDFC0001234"
};

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id);
  if (!invoice) notFound();

  const isDraft = invoice.status === 'draft';
  const isSent = invoice.status === 'sent';
  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';

  return (
    <div className="space-y-8 pb-20">
      <GSTPrint invoice={invoice} studio={studio} />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 no-print">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full shadow-sm" asChild>
            <Link href="/invoices">
               <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold tracking-tight">{invoice.invoice_number}</h1>
               <Badge className={cn(
                  "text-[10px] uppercase font-black tracking-widest px-3",
                  isPaid ? "bg-emerald-500" : isOverdue ? "bg-rose-500" : "bg-amber-500"
               )}>
                  {invoice.status}
               </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Client: {invoice.client.full_name}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold px-6" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" /> Print Invoice
           </Button>
           {isSent && (
              <Button className="bg-primary shadow-xl shadow-primary/20 h-11 px-8 rounded-xl font-bold">
                 Record Manual Payment
              </Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start no-print">
         
         {/* Left: Invoice Document View */}
         <div className="lg:col-span-8">
            <InvoiceDocument invoice={invoice} studio={studio} />
         </div>

         {/* Right: Actions & Tracking */}
         <div className="lg:col-span-4 space-y-8">
            {/* Status Card */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-8 space-y-6">
               <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment Progress</div>
                  <h3 className="text-lg font-black text-slate-900">
                    {invoice.amount_paid > 0 ? `${formatINR(invoice.amount_paid)} Received` : 'No payments yet'}
                  </h3>
               </div>
               
               <InvoiceStatusProgress 
                 amountPaid={invoice.amount_paid} 
                 totalAmount={invoice.total_amount} 
               />

               {!isPaid && (
                 <div className="bg-rose-50 p-4 rounded-2xl flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-rose-600 tracking-widest">Outstanding</span>
                    <span className="text-lg font-black text-rose-600 tracking-tight">{formatINR(invoice.amount_due)}</span>
                 </div>
               )}

               <div className="pt-4 grid grid-cols-1 gap-3">
                  {isDraft && (
                    <Button className="w-full h-12 bg-primary rounded-xl font-bold shadow-lg shadow-primary/20">
                       <Send className="w-4 h-4 mr-2" /> Send to Client
                    </Button>
                  )}
                  {isSent && (
                    <Button className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-200">
                       <Send className="w-4 h-4 mr-2" /> Send Reminder
                    </Button>
                  )}
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-slate-200">
                     <Download className="w-4 h-4 mr-2" /> Download PDF
                  </Button>
               </div>
            </Card>

            {/* Payment Link Card */}
            {(isSent || isOverdue) && <PaymentLinkCard invoice={invoice} />}

            {/* History / Audit Log */}
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-8 space-y-6">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <History className="w-4 h-4" /> Activity Log
               </h3>
               <div className="space-y-6">
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <FileCheck className="w-4 h-4" />
                     </div>
                     <div>
                        <div className="text-xs font-bold text-slate-900">Invoice Created</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{formatIndianDateTime(invoice.created_at)}</p>
                     </div>
                  </div>
                  {invoice.payments.map((p: any) => (
                    <div key={p.id} className="flex gap-4">
                       <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                          <CreditCard className="w-4 h-4" />
                       </div>
                       <div>
                          <div className="text-xs font-bold text-emerald-600">Payment Recorded</div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{formatINR(p.amount)} via {p.method.toUpperCase()}</p>
                          <p className="text-[9px] font-mono text-slate-400">{formatIndianDateTime(p.payment_date)}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
