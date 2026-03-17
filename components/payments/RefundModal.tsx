"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertCircle, 
  Loader2, 
  RotateCcw,
  ShieldAlert
} from "lucide-react";
import { formatINR } from "@/lib/formatters";
import { toast } from "sonner";

interface RefundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: any;
  onSuccess: () => void;
}

export function RefundModal({ open, onOpenChange, payment, onSuccess }: RefundModalProps) {
  const [amount, setAmount] = useState(payment.amount.toString());
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRefund = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Refund of ${formatINR(amount)} initiated`);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to initiate refund");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-8 gap-6">
        <DialogHeader>
          <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
             <RotateCcw className="w-6 h-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">Initiate Refund</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            This will reverse the payment for invoice <span className="font-mono font-bold text-slate-900">{payment.invoice_number}</span> via the original payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
           <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                Funds will be returned to the client&apos;s source account within 5-7 business days. This action cannot be undone.
              </p>
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Refund Amount</Label>
              <div className="relative">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-400">₹</span>
                 <Input 
                   type="number" 
                   value={amount} 
                   onChange={(e) => setAmount(e.target.value)}
                   className="h-14 pl-10 text-xl font-black border-slate-200 focus:border-rose-500 rounded-xl" 
                 />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                Max: {formatINR(payment.amount)}
              </p>
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Reason for Refund</Label>
              <Textarea 
                placeholder="Client cancelled, duplicate payment, etc..." 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-50 border-none rounded-xl p-4 min-h-[80px] focus:bg-white transition-all text-sm"
              />
           </div>
        </div>

        <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-12 rounded-xl font-bold">
              Cancel
           </Button>
           <Button 
             className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-xl shadow-rose-200"
             onClick={handleRefund}
             disabled={isLoading || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > payment.amount}
           >
             {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Confirm Refund"}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
