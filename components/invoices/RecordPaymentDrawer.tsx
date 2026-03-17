"use client";

import { useState } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  IndianRupee, 
  Loader2, 
  Calendar as CalendarIcon, 
  CreditCard,
  Banknote,
  Send,
  ArrowRight
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { useInvoice } from "@/hooks/use-invoice";

interface RecordPaymentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: any;
  onSuccess: () => void;
}

const paymentMethods = [
  { value: "upi", label: "UPI", icon: Send },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "net_banking", label: "Net Banking", icon: Banknote },
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "neft", label: "NEFT/RTGS", icon: Banknote },
  { value: "cheque", label: "Cheque", icon: Banknote },
  { value: "other", label: "Other", icon: Banknote }
];

export function RecordPaymentDrawer({ open, onOpenChange, invoice, onSuccess }: RecordPaymentDrawerProps) {
  const { recordPayment, isLoading } = useInvoice();
  
  const [amount, setAmount] = useState(invoice.amount_due.toString());
  const [method, setMethod] = useState("upi");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    const success = await recordPayment(invoice.id, {
      amount: parseFloat(amount),
      method,
      reference_number: reference,
      payment_date: date,
      notes
    });

    if (success) {
      onSuccess();
      onOpenChange(false);
    }
  };

  const getReferenceLabel = () => {
    switch (method) {
      case 'neft':
      case 'rtgs': return 'UTR Number';
      case 'cheque': return 'Cheque Number';
      case 'upi': return 'UPI Transaction ID';
      case 'card': return 'Last 4 digits';
      default: return 'Reference Number';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md rounded-l-3xl p-8 space-y-8 overflow-y-auto">
        <SheetHeader>
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
             <IndianRupee className="w-6 h-6" />
          </div>
          <SheetTitle className="text-2xl font-black tracking-tight">Record Payment</SheetTitle>
          <SheetDescription className="text-slate-500 font-medium">
            Manually enter a payment received via offline channels for invoice <span className="font-mono font-bold text-slate-900">{invoice.invoice_number}</span>.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Amount Received</Label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
                 <Input 
                   type="number" 
                   value={amount} 
                   onChange={(e) => setAmount(e.target.value)}
                   className="h-14 pl-10 text-xl font-black border-slate-200 focus:border-emerald-500 focus:bg-emerald-50/20 transition-all rounded-xl" 
                 />
              </div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-right">
                {formatINR(invoice.amount_due)} Outstanding
              </p>
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                 <SelectTrigger className="h-12 border-slate-200 rounded-xl">
                    <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-slate-100 p-1">
                    {paymentMethods.map(m => (
                      <SelectItem key={m.value} value={m.value} className="h-10 rounded-lg">
                         <div className="flex items-center gap-3">
                            <m.icon className="w-4 h-4 text-slate-400" />
                            <span className="font-bold text-xs uppercase tracking-widest">{m.label}</span>
                         </div>
                      </SelectItem>
                    ))}
                 </SelectContent>
              </Select>
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">{getReferenceLabel()}</Label>
              <Input 
                placeholder={`Enter ${getReferenceLabel().toLowerCase()}...`}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="h-12 border-slate-200 rounded-xl font-mono text-sm uppercase tracking-widest" 
              />
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Payment Date</Label>
              <div className="relative">
                 <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <Input 
                   type="date" 
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   max={new Date().toISOString().split('T')[0]}
                   className="h-12 pl-12 border-slate-200 rounded-xl" 
                 />
              </div>
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Notes (Optional)</Label>
              <Textarea 
                placeholder="Internal notes about this transaction..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-50 border-none rounded-xl p-4 min-h-[80px] focus:bg-white transition-all text-sm"
              />
           </div>
        </div>

        <SheetFooter className="pt-8">
           <Button 
             className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl shadow-emerald-200/50 transition-all active:scale-95"
             onClick={handleSubmit}
             disabled={isLoading || !amount || parseFloat(amount) <= 0}
           >
             {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Recording...</> : <><IndianRupee className="w-4 h-4 mr-2" /> Record Full Payment</>}
           </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
