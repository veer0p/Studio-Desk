"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, IndianRupee } from "lucide-react";
import { toast } from "sonner";
import { useRazorpay } from "@/hooks/use-razorpay";

interface RazorpayButtonProps {
  invoice: any;
  studio: any;
  onSuccess: (data: any) => void;
  onFailure?: (error: any) => void;
}

export function RazorpayButton({ invoice, studio, onSuccess, onFailure }: RazorpayButtonProps) {
  const { isScriptLoaded, initiatePayment, isLoading, error } = useRazorpay();

  const handlePaymentClick = () => {
    initiatePayment({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(invoice.amount_due * 100), // paise
      currency: 'INR',
      name: studio.name,
      description: `Invoice: ${invoice.invoice_number}`,
      image: studio.logo_url || 'https://studiodesk.io/logo.png',
      prefill: {
        name: invoice.client?.full_name,
        email: invoice.client?.email,
        contact: invoice.client?.phone,
      },
      notes: {
        invoice_id: invoice.id,
        studio_id: invoice.studio_id,
        booking_id: invoice.booking_id,
      },
      theme: { color: studio.brand_color || '#1A3C5E' },
      handler: async function(response: any) {
        try {
          // Success handler (frontend confirmation)
          await onSuccess(response);
          toast.success("Payment successful!");
        } catch (err) {
          onFailure?.(err);
        }
      },
      modal: {
        ondismiss: () => {
          // Toast or logic for when user closes modal
        }
      }
    });
  };

  return (
    <div className="w-full space-y-4">
      <Button 
        onClick={handlePaymentClick}
        disabled={!isScriptLoaded || isLoading || !!error}
        className="w-full h-16 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-black shadow-2xl transition-all active:scale-[0.98] group"
      >
        {isLoading ? (
          <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Preparing Checkout...</>
        ) : (
          <>
            <IndianRupee className="w-5 h-5 mr-3" /> Pay Now
            <span className="ml-2 py-1 px-3 bg-white/10 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              Secure
            </span>
          </>
        )}
      </Button>

      {error ? (
        <p className="text-xs text-rose-500 font-bold text-center uppercase tracking-widest">{error}</p>
      ) : (
        <div className="flex items-center justify-center gap-2 opacity-40">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-[10px] font-bold uppercase tracking-widest">PCI-DSS Compliant Gateway</span>
        </div>
      )}
    </div>
  );
}
