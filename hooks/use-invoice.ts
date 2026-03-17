"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Invoice } from "@/types";

export function useInvoice(invoiceId?: string) {
  const [isLoading, setIsLoading] = useState(false);

  const sendInvoice = async (id: string, channels: { email: boolean; whatsapp: boolean }) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channels),
      });
      if (!res.ok) throw new Error('Failed to send invoice');
      toast.success("Invoice sent successfully");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const recordPayment = async (id: string, paymentData: any) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}/record-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
      if (!res.ok) throw new Error('Failed to record payment');
      toast.success(`Payment of ₹${paymentData.amount} recorded`);
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateLink = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}/payment-link`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to regenerate payment link');
      const data = await res.json();
      toast.success("Payment link regenerated");
      return data;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const copyPaymentLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Payment link copied to clipboard");
  };

  const downloadPDF = async (id: string) => {
    window.open(`/api/invoices/${id}/pdf`, '_blank');
  };

  return {
    sendInvoice,
    recordPayment,
    regenerateLink,
    copyPaymentLink,
    downloadPDF,
    isLoading,
  };
}
