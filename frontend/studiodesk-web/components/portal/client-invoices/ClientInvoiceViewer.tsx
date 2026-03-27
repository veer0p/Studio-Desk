// components/portal/client-invoices/ClientInvoiceViewer.tsx
"use client"

import { PayNowButton } from "./PayNowButton"
import { Download, Building2 } from "lucide-react"

export function ClientInvoiceViewer({ studioSlug, invoiceId }: { studioSlug: string, invoiceId: string }) {

  const studioName = studioSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
  
  // Real world payload mock
  const balance = 225000

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300 pb-24">
      
      {/* Read-Only Clean Viewer matching internal Studio Invoice Layouts visually */}
      <div className="bg-card w-full border border-border/40 rounded-xl sm:rounded-2xl p-6 sm:p-12 shadow-sm font-sans mb-8">
        
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border/40 pb-8 mb-8">
           <div>
             <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
               <Building2 className="w-6 h-6 text-[hsl(var(--portal-primary))]" />
             </div>
             <h2 className="text-xl font-bold tracking-tight text-foreground">{studioName}</h2>
             <div className="text-sm text-muted-foreground mt-2 space-y-0.5">
               <p>12th Floor, Trade Centre</p>
               <p>Lower Parel, Mumbai 400013</p>
               <p className="mt-2 text-foreground font-medium">GSTIN: <span className="font-mono bg-muted px-1.5 py-0.5 rounded">27AADCS1234E1Z9</span></p>
             </div>
           </div>
           
           <div className="sm:text-right">
              <h1 className="text-3xl font-bold text-foreground tracking-tight underline underline-offset-4 decoration-[hsl(var(--portal-primary))/50]">INVOICE</h1>
              <p className="text-lg font-mono font-medium text-muted-foreground mt-2">{invoiceId}</p>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p>Date of Issue: <strong className="text-foreground">12 Apr 2026</strong></p>
                <p>Due Date: <strong className="text-red-500 font-semibold">14 Apr 2026</strong></p>
              </div>
           </div>
        </div>

        {/* Bill To Matrix */}
        <div className="mb-10 p-5 bg-muted/10 rounded-xl border border-border/40 w-full sm:w-1/2">
           <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">Billed To</p>
           <h3 className="text-lg font-bold text-foreground">Rohan Sharma</h3>
           <p className="text-sm text-muted-foreground mt-1">Priya & Raj Wedding Packages</p>
           <p className="text-sm font-medium mt-2">+91 98765 43210</p>
        </div>

        {/* Ledger */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm text-left">
             <thead className="bg-muted/30 border-y border-border/40 text-muted-foreground">
               <tr>
                 <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs">Description</th>
                 <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs text-right">Qty</th>
                 <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs text-right">Rate</th>
                 <th className="py-3 px-4 font-semibold uppercase tracking-wider text-xs text-right">Total</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border/20">
               <tr>
                 <td className="py-4 px-4">
                   <p className="font-bold text-foreground">Wedding Photography Retainer</p>
                   <p className="text-xs text-muted-foreground mt-1">Initial 50% block against Premium Film & Photo tier.</p>
                 </td>
                 <td className="py-4 px-4 text-right">1</td>
                 <td className="py-4 px-4 text-right">₹1,90,678</td>
                 <td className="py-4 px-4 text-right font-medium">₹1,90,678</td>
               </tr>
             </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end border-t border-border/40 pt-6">
           <div className="w-full sm:w-1/2 space-y-3 shrink-0">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Subtotal</span>
               <span className="font-medium">₹1,90,678.00</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">CGST (9%)</span>
               <span className="font-medium">₹17,161.00</span>
             </div>
             <div className="flex justify-between text-sm pb-3 border-b border-border/40">
               <span className="text-muted-foreground">SGST (9%)</span>
               <span className="font-medium">₹17,161.00</span>
             </div>
             <div className="flex justify-between items-center pt-1">
               <span className="text-lg font-bold text-foreground">Grand Total</span>
               <span className="text-xl font-mono font-bold">₹2,25,000.00</span>
             </div>
           </div>
        </div>

      </div>

      {/* Payment Processing UI */}
      <h3 className="text-lg font-bold tracking-tight mb-4 px-1">Payment Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold tracking-tight mb-2">Online Checkout</h4>
            <p className="text-sm text-muted-foreground mb-6">Pay instantly via UPI, Credit Card, or NetBanking. Payments reflect in real-time.</p>
            <PayNowButton balance={balance} studioSlug={studioSlug} />
         </div>

         <div className="bg-card border border-border/80 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold tracking-tight flex items-center justify-between mb-4">
              <span>Offline Bank Transfer</span>
              <span className="text-xs font-bold bg-muted px-2 py-1 rounded">No Fees</span>
            </h4>
            <div className="space-y-3 text-sm bg-muted/10 p-4 rounded-lg border border-border/40 font-mono">
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Account Name:</span>
                 <span className="font-bold">{studioName.toUpperCase()} PVT LTD</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">Account No:</span>
                 <span className="font-bold">50200021338874</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-muted-foreground">IFSC Code:</span>
                 <span className="font-bold">HDFC0001234</span>
               </div>
               <div className="flex justify-between border-t border-border/40 pt-2 mt-1">
                 <span className="text-muted-foreground">UPI ID:</span>
                 <span className="font-bold text-[hsl(var(--portal-primary))]">studio@hdfcbank</span>
               </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">After paying, please WhatsApp the UTR / screenshot.</p>
         </div>

      </div>

    </div>
  )
}
