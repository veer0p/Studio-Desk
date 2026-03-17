"use client";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Eye, 
  Edit2, 
  Send, 
  Download, 
  CreditCard, 
  XCircle, 
  Trash2,
  Copy,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Invoice } from "@/types";
import Link from "next/link";
import { useInvoice } from "@/hooks/use-invoice";

interface InvoiceActionsMenuProps {
  invoice: Invoice;
  onAction?: (action: string) => void;
}

export function InvoiceActionsMenu({ invoice, onAction }: InvoiceActionsMenuProps) {
  const { downloadPDF, copyPaymentLink } = useInvoice();

  const isDraft = invoice.status === 'draft';
  const isSent = invoice.status === 'sent';
  const isPaid = invoice.status === 'paid';
  const isPartial = invoice.status === 'partially_paid';
  const isOverdue = invoice.status === 'overdue';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-slate-100 shadow-sm bg-white">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl border-slate-100">
        <DropdownMenuItem asChild className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest">
           <Link href={`/invoices/${invoice.id}`}>
              <Eye className="w-4 h-4 mr-2 text-slate-400" /> View Detail
           </Link>
        </DropdownMenuItem>
        
        {isDraft && (
          <DropdownMenuItem asChild className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest">
             <Link href={`/invoices/${invoice.id}/edit`}>
                <Edit2 className="w-4 h-4 mr-2 text-primary" /> Edit Draft
             </Link>
          </DropdownMenuItem>
        )}

        {(isDraft || isSent || isOverdue) && (
          <DropdownMenuItem className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest" onClick={() => onAction?.('send')}>
            <Send className="w-4 h-4 mr-2 text-amber-500" /> {isDraft ? 'Send Invoice' : 'Resend Invoice'}
          </DropdownMenuItem>
        )}

        {(isSent || isPartial || isOverdue) && (
          <>
            <DropdownMenuItem className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest" onClick={() => invoice.razorpay_link_url && copyPaymentLink(invoice.razorpay_link_url)}>
              <Copy className="w-4 h-4 mr-2 text-blue-500" /> Copy Pay Link
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest text-emerald-600 focus:text-emerald-600" onClick={() => onAction?.('record')}>
              <CreditCard className="w-4 h-4 mr-2" /> Record Payment
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-1 bg-slate-50" />
        
        <DropdownMenuItem className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest" onClick={() => downloadPDF(invoice.id)}>
          <Download className="w-4 h-4 mr-2 text-slate-400" /> Download PDF
        </DropdownMenuItem>

        {isPaid && (
          <DropdownMenuItem asChild className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest">
             <Link href={`/invoices/${invoice.id}/credit-note`}>
                <Receipt className="w-4 h-4 mr-2 text-purple-500" /> Credit Note
             </Link>
          </DropdownMenuItem>
        )}

        {(isDraft || isSent || isOverdue) && (
          <DropdownMenuItem className="rounded-xl h-10 font-bold text-xs uppercase tracking-widest text-rose-500 focus:text-rose-500" onClick={() => onAction?.('cancel')}>
            <XCircle className="w-4 h-4 mr-2" /> {isDraft ? 'Delete Draft' : 'Mark Cancelled'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
