"use client"

import { GSTBreakdown } from "../shared/GSTBreakdown"

const formatINR = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function InvoicePreview({ invoice }: { invoice: any }) {
  if (!invoice) return null

  // Fallback defaults for visual demo
  const studioName = "StudioDesk Visuals"
  const studioAddress = "123 Creative Studio Lane, \nNavi Mumbai, MH 400706"
  const studioGST = "27AABCU9603R1ZX"
  const studioPhone = "+91 98765 43210"

  const items = invoice.lineItems || [
    { id: 1, description: "Pre-wedding Photography", hsn: "998386", qty: 1, rate: 45000, gstRate: 18, amount: 45000 },
    { id: 2, description: "Candid Cinematic Video", hsn: "998386", qty: 1, rate: 55000, gstRate: 18, amount: 55000 }
  ]

  const subtotal = items.reduce((acc: number, item: any) => acc + item.amount, 0)
  const isPaid = invoice.balance === 0
  const isPartial = invoice.paidAmount > 0 && invoice.balance > 0

  return (
    <div className="bg-white p-8 border border-border/40 shadow-sm text-slate-800 text-sm h-full overflow-y-auto custom-scrollbar relative">
      
      {/* Visual Watermark if Paid/Cancelled */}
      {isPaid && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none transform -rotate-12 border-8 border-emerald-600 rounded-xl p-4">
          <span className="text-6xl font-black text-emerald-600 tracking-widest uppercase">PAID</span>
        </div>
      )}

      {invoice.status.toLowerCase() === "cancelled" && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none transform -rotate-12 border-8 border-red-600 rounded-xl p-4">
          <span className="text-6xl font-black text-red-600 tracking-widest uppercase">CANCELLED</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="w-12 h-12 bg-slate-900 rounded mb-4 flex items-center justify-center text-white font-bold text-xl">
            SD
          </div>
          <h2 className="text-lg font-bold text-slate-900">{studioName}</h2>
          <p className="whitespace-pre-line text-slate-500 mt-1">{studioAddress}</p>
          <div className="mt-2 text-slate-500 text-xs space-y-0.5 mt-4">
            <p>GSTIN: <span className="font-medium text-slate-700">{studioGST}</span></p>
            <p>Phone: {studioPhone}</p>
          </div>
        </div>
        
        <div className="text-right">
          <h1 className="text-4xl font-light tracking-wider text-slate-300 mb-4 uppercase">Invoice</h1>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-right text-xs">
            <span className="text-slate-500">Invoice #</span>
            <span className="font-medium text-slate-900">{invoice.invoiceNumber}</span>
            <span className="text-slate-500">Issue Date</span>
            <span className="font-medium text-slate-900">{invoice.issueDate}</span>
            <span className="text-slate-500">Due Date</span>
            <span className="font-medium text-slate-900">{invoice.dueDate}</span>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200 mb-10"></div>

      {/* Bill To */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bill To</h3>
        <p className="font-bold text-slate-900 text-base">{invoice.clientName}</p>
        <p className="text-slate-500 mt-1 max-w-xs">{invoice.clientAddress || `${invoice.clientCity}\nIndia`}</p>
        {invoice.clientGST && (
          <p className="text-slate-500 text-xs mt-2">GSTIN: <span className="font-medium text-slate-700">{invoice.clientGST}</span></p>
        )}
      </div>

      {/* Line Items */}
      <table className="w-full text-left mb-8 border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
            <th className="py-3 px-2 font-medium">Description</th>
            <th className="py-3 px-2 font-medium">HSN</th>
            <th className="py-3 px-2 font-medium text-right">Qty</th>
            <th className="py-3 px-2 font-medium text-right">Rate</th>
            <th className="py-3 px-2 font-medium text-right">Tax</th>
            <th className="py-3 px-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item: any, i: number) => (
            <tr key={i} className="text-sm">
              <td className="py-4 px-2 font-medium text-slate-900">{item.description}</td>
              <td className="py-4 px-2 text-slate-500 text-xs">{item.hsn}</td>
              <td className="py-4 px-2 text-right text-slate-500">{item.qty}</td>
              <td className="py-4 px-2 text-right text-slate-500">{formatINR(item.rate)}</td>
              <td className="py-4 px-2 text-right text-slate-500">{item.gstRate}%</td>
              <td className="py-4 px-2 text-right font-medium font-mono text-slate-900">{formatINR(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals Section */}
      <div className="flex justify-end mb-12">
        <div className="w-full max-w-sm">
          <GSTBreakdown 
            subtotal={subtotal} 
            gstType={invoice.gstType || "cgst_sgst"} 
            gstRate={18} 
          />
          
          <div className="flex justify-between items-center text-sm pt-4 mt-2">
            <span className="text-slate-500">Amount Paid</span>
            <span className="font-mono text-emerald-600 font-medium">{formatINR(invoice.paidAmount || 0)}</span>
          </div>
          
          <div className="flex justify-between items-center text-base pt-2">
            <span className="font-bold text-slate-900">Balance Due</span>
            <span className={`font-mono font-bold tracking-tight ${invoice.balance > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {formatINR(invoice.balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Terms & Bank */}
      <div className="grid grid-cols-2 gap-8 text-xs text-slate-500 border-t border-slate-200 pt-8">
        <div>
          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[10px]">Payment Terms & Notes</h4>
          <p className="whitespace-pre-line leading-relaxed">
            {invoice.paymentTerms || "50% advance to confirm booking.\nRemaining balance due 1 week prior to the event date.\nLate fees of 2% per month apply to overdue balances."}
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-[10px]">Payment Details</h4>
          <div className="space-y-1">
            <p>Bank: <span className="font-medium text-slate-700">HDFC Bank</span></p>
            <p>Account Name: <span className="font-medium text-slate-700">StudioDesk Visuals</span></p>
            <p>Account No: <span className="font-medium text-slate-700">50200012345678</span></p>
            <p>IFSC: <span className="font-medium text-slate-700">HDFC0001234</span></p>
            <p className="mt-2 text-slate-500 bg-slate-100 inline-block px-2 py-1 rounded">UPI: <span className="font-medium text-slate-700">studiodesk@hdfcbank</span></p>
          </div>
        </div>
      </div>
      
      <div className="text-center text-slate-400 text-xs mt-16 pb-8">
        <p>Thank you for your business!</p>
      </div>

    </div>
  )
}
