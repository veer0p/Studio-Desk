"use client"

import { useState } from "react"
import { InvoicePreview } from "./InvoicePreview"
import { Button } from "@/components/ui/button"
import { X, Send, Download, Phone, Mail } from "lucide-react"

export function InvoiceDetail({ invoiceId, onClose }: { invoiceId: string, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("preview")

  // Mock fetching data based on invoiceId here
  const mockInvoice = {
    invoiceNumber: invoiceId,
    clientName: "Rohan & Priya",
    clientCity: "Mumbai",
    issueDate: "12 Oct 2025",
    dueDate: "27 Oct 2025",
    amount: 240000,
    paidAmount: 100000,
    balance: 140000,
    status: "Partial",
    gstType: "cgst_sgst",
    lineItems: [
      { id: 1, description: "Pre-wedding Photography", hsn: "998386", qty: 1, rate: 45000, gstRate: 18, amount: 45000 },
      { id: 2, description: "Candid Cinematic Video", hsn: "998386", qty: 1, rate: 55000, gstRate: 18, amount: 55000 }
    ],
    payments: [
      { id: 1, date: "12 Oct 2025", amount: 100000, method: "Bank Transfer", ref: "IMPS1234" }
    ],
    timeline: [
      { type: "Created", date: "10 Oct 2025, 09:00 AM", desc: "Invoice generated successfully" },
      { type: "Sent", date: "10 Oct 2025, 09:15 AM", desc: "Sent via Email and WhatsApp" },
      { type: "Viewed", date: "11 Oct 2025, 04:30 PM", desc: "Viewed by rohan@example.com" },
      { type: "Payment", date: "12 Oct 2025, 11:00 AM", desc: "Received ₹1,00,000 via NEFT" }
    ]
  }

  const tabs = [
    { id: "preview", label: "Preview" },
    { id: "details", label: "Details" },
    { id: "payments", label: "Payments" },
    { id: "activity", label: "Activity" }
  ]

  return (
    <div className="h-full flex flex-col bg-card">
      
      {/* Slide-over Header */}
      <div className="px-6 py-4 flex items-start justify-between border-b border-border/40 bg-muted/20 shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-mono font-bold tracking-tight">{mockInvoice.invoiceNumber}</h2>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase border bg-amber-500/10 text-amber-600 border-amber-500/20`}>
              {mockInvoice.status}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground gap-1.5">
            <span className="font-medium text-foreground">{mockInvoice.clientName}</span>
            <span className="text-border">•</span>
            <span className="hover:text-primary cursor-pointer transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3" /> Call
            </span>
            <span className="text-border">•</span>
            <span className="hover:text-primary cursor-pointer transition-colors flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
            </Button>
            <Button size="sm" className="h-8 text-xs">
              <Send className="w-3.5 h-3.5 mr-1.5" /> Send
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40 shrink-0 px-6 bg-muted/10">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Container */}
      <div className="flex-1 overflow-auto bg-muted/5 relative">
        {activeTab === "preview" && (
          <div className="h-full">
            <InvoicePreview invoice={mockInvoice} />
          </div>
        )}

        {activeTab === "details" && (
          <div className="p-6 text-muted-foreground text-sm flex flex-col items-center justify-center h-full opacity-50">
            Details Edit Form implementation
          </div>
        )}

        {activeTab === "payments" && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/60 shadow-sm">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-muted-foreground">Balance Due</span>
                <span className="text-xl font-mono font-bold text-amber-500">₹1,40,000</span>
              </div>
              <Button size="sm">Record Payment</Button>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground px-1 uppercase tracking-wider">Payment History</h3>
              {mockInvoice.payments.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/60 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{p.date}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      {p.method} • <span className="bg-muted px-1 rounded text-foreground">{p.ref}</span>
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">₹1,00,000</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="p-6">
            <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
              {mockInvoice.timeline.map((t, i) => (
                <div key={i} className="relative flex items-center">
                  <div className="flex items-center justify-center w-3 h-3 rounded-full bg-primary border-[3px] border-background ring-1 ring-border shadow shrink-0 z-10 -ml-[21px]" />
                  <div className="flex-1 flex flex-col ml-4 p-3 rounded-lg border border-border/40 bg-card shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold">{t.type}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{t.date}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
