"use client";

import { useState, useEffect } from "react";
import { AlertCircle, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/formatters";
import Link from "next/link";
import { Invoice } from "@/types";

interface OverdueInvoiceBannerProps {
  overdueInvoices: Invoice[];
}

export function OverdueInvoiceBanner({ overdueInvoices }: OverdueInvoiceBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("overdue_banner_dismissed");
    if (dismissed) setIsDismissed(true);
  }, []);

  if (isDismissed || overdueInvoices.length === 0) return null;

  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount_due, 0);
  const handleDismiss = () => {
    sessionStorage.setItem("overdue_banner_dismissed", "true");
    setIsDismissed(true);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="text-sm font-medium text-amber-900">
          {overdueInvoices.length === 1 ? (
             <>Invoice <span className="font-mono font-bold">{overdueInvoices[0].invoice_number}</span> is overdue by {formatINR(overdueInvoices[0].amount_due)}</>
          ) : (
             <>You have <span className="font-bold">{overdueInvoices.length} overdue invoices</span> totalling <span className="font-bold">{formatINR(totalOverdue)}</span></>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="link" asChild className="text-amber-700 font-bold text-xs uppercase tracking-widest hover:text-amber-900 p-0">
          <Link href="/invoices?status=overdue">
            View Overdue <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
        <button 
          onClick={handleDismiss}
          className="p-1 hover:bg-amber-100 rounded-full text-amber-400 hover:text-amber-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
