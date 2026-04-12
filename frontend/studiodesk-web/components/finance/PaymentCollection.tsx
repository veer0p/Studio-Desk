"use client"

import { useState } from "react"
import { Check, Copy, ChevronDown, ChevronUp, CheckCircle2, MessageSquare, QrCode, ArrowUpRight } from "lucide-react"

// Mock invoices array
const mockInvoices = [
    { id: "INV-089", client: "John Doe", date: "Oct 12", amount: 6490, status: "Pending" },
    { id: "INV-088", client: "Alice M.", date: "Oct 10", amount: 1200, status: "Overdue" },
    { id: "INV-087", client: "Smith Wed", date: "Oct 05", amount: 2000, status: "Paid" },
    { id: "INV-086", client: "Eve G.", date: "Sep 28", amount: 3500, status: "Pending" },
]

export default function PaymentCollection() {
    const [invoices, setInvoices] = useState(mockInvoices)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null)

    // Animation trackers
    const [justPaidId, setJustPaidId] = useState<string | null>(null)

    const toggleSelectAll = () => {
        if (selectedIds.size === invoices.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(invoices.map(i => i.id)))
        }
    }

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    const handleCopyUpi = (e: React.MouseEvent) => {
        e.stopPropagation()
        // Simulated clipboard interaction
        console.log("UPI ID Copied")
    }

    const markPaid = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()

        // Trigger animation
        setJustPaidId(id)

        setTimeout(() => {
            setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: "Paid" } : inv))
            setTimeout(() => setJustPaidId(null), 1000)
        }, 400)
    }

    const markBulkPaid = () => {
        selectedIds.forEach(id => markPaid(id))
        setSelectedIds(new Set())
    }

    const formatAmount = (amt: number) => amt.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

    const getStatusStyles = (status: string) => {
        if (status === "Paid") return "text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30"
        if (status === "Overdue") return "text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/30"
        return "text-[#78716c] bg-[#222] border border-[#333]"
    }

    return (
        <div className="flex flex-col h-full bg-[#0f0f0f] relative font-sans text-[#fafaf9]">

            {/* Sticky Bulk Toolbar (Appears contextually or strictly adheres to top as mandated if always present, we'll keep it always present as per the wireframe block) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#1a1a1a] sticky top-0 z-20">
                <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <div
                        onClick={toggleSelectAll}
                        className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors ${selectedIds.size === invoices.length && invoices.length > 0 ? "bg-[#f59e0b] border-[#f59e0b]" : "bg-transparent border-[#555] group-hover:border-[#f59e0b]"}`}
                    >
                        {selectedIds.size === invoices.length && invoices.length > 0 && <Check className="w-3.5 h-3.5 text-[#0f0f0f] stroke-[3]" />}
                    </div>
                    <span className="text-[#78716c] font-semibold uppercase tracking-widest text-xs select-none">
                        {selectedIds.size > 0 ? `${selectedIds.size} Selected` : 'Select All'}
                    </span>
                </label>

                <div className={`flex items-center gap-4 transition-opacity duration-300 ${selectedIds.size > 0 ? "opacity-100 pointer-events-auto" : "opacity-30 pointer-events-none"}`}>
                    <button onClick={markBulkPaid} className="h-9 px-4 flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#10b981]/20 hover:text-[#10b981] hover:border-[#10b981]/50 border border-transparent text-[#fafaf9] text-sm font-medium rounded-lg transition-colors group">
                        <CheckCircle2 className="w-4 h-4 text-[#78716c] group-hover:text-[#10b981] transition-colors" />
                        Mark Bulk Paid
                    </button>

                    <button className="h-9 px-4 flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#0f0f0f] text-sm font-semibold rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        Send Outstanding Reminders
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto w-full max-w-5xl mx-auto py-8 px-4 lg:px-0">

                <div className="rounded-xl border border-[#333] overflow-hidden bg-[#1a1a1a] shadow-xl">
                    {invoices.map((inv) => {
                        const isSelected = selectedIds.has(inv.id)
                        const isExpanded = expandedRowId === inv.id
                        const isJustPaid = justPaidId === inv.id

                        return (
                            <div key={inv.id} className="flex flex-col border-b border-[#222] last:border-b-0 overflow-hidden transition-colors relative">

                                {/* 1% noise grain across row */}
                                <div className="absolute inset-0 opacity-[0.01] pointer-events-none mix-blend-overlay z-[1]"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                                />

                                {/* Main Row */}
                                <div
                                    onClick={() => setExpandedRowId(isExpanded ? null : inv.id)}
                                    className={`relative flex items-center justify-between px-6 py-4 min-h-[64px] cursor-pointer hover:bg-[#222] transition-colors z-[2] ${isSelected ? "bg-[#222]/50" : ""} ${isJustPaid ? "bg-[#10b981]/10 overflow-hidden" : ""}`}
                                >
                                    {/* Payment success flash animation */}
                                    {isJustPaid && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#10b981]/30 to-transparent animate-[shimmer_0.8s_ease-out_forwards]"
                                            style={{ backgroundSize: '200% 100%' }} />
                                    )}

                                    <div className="flex items-center gap-6">
                                        <div
                                            onClick={(e) => toggleSelect(inv.id, e)}
                                            className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors shadow-sm ${isSelected ? "bg-[#f59e0b] border-[#f59e0b]" : "bg-transparent border-[#555] hover:border-[#f59e0b]"}`}
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5 text-[#0f0f0f] stroke-[3]" />}
                                        </div>

                                        <div className="w-24 font-mono font-medium text-[#78716c] tabular-nums">
                                            {inv.id}
                                        </div>

                                        <div className="w-48 font-serif text-[#fafaf9] text-base truncate" style={{ fontFamily: '"Playfair Display", serif' }}>
                                            {inv.client}
                                        </div>

                                        <div className="w-24 text-sm text-[#78716c]">
                                            {inv.date}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="w-24 text-right font-mono text-[#fafaf9] tabular-nums font-semibold tracking-wide">
                                            ₹{formatAmount(inv.amount)}
                                        </div>

                                        <div className="w-24 flex justify-end">
                                            <div className={`px-2.5 py-1 text-xs font-semibold rounded-[4px] ${getStatusStyles(inv.status)} transition-colors duration-500`}>
                                                {inv.status}
                                            </div>
                                        </div>

                                        <div className="w-32 flex justify-end">
                                            {inv.status === "Paid" ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); console.log("Receipt"); }}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-[#333] text-[#fafaf9] bg-[#222] hover:bg-[#333] hover:border-[#555] rounded-lg transition-colors"
                                                >
                                                    <FileTextIcon className="w-3.5 h-3.5 text-[#78716c]" />
                                                    Receipt
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleCopyUpi}
                                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/5 hover:bg-[#f59e0b] hover:text-[#0f0f0f] rounded-lg transition-colors group"
                                                >
                                                    <Copy className="w-3.5 h-3.5 opacity-80" />
                                                    Copy UPI
                                                </button>
                                            )}
                                        </div>

                                        <div className="w-6 flex justify-end text-[#78716c]">
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Inline QR Expansion Panel */}
                                <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out bg-[#141414] border-t border-[#0f0f0f] z-[2] ${isExpanded ? "max-h-64 opacity-100" : "max-h-0 opacity-0 border-t-transparent"}`}>
                                    <div className="p-6 flex justify-end">
                                        <div className="flex gap-6 items-center p-4 rounded-xl border border-[#333] bg-[#0f0f0f] shadow-inner min-w-[320px]">

                                            {/* Fake QR Graphic using Lucide */}
                                            <div className="w-20 h-20 bg-[#fafaf9] p-2 rounded flex flex-col items-center justify-center shrink-0">
                                                <QrCode className="w-full h-full text-[#0f0f0f]" />
                                            </div>

                                            <div className="flex flex-col gap-2 flex-1">
                                                <p className="text-sm font-medium text-[#fafaf9]">
                                                    Pay <span className="font-mono tabular-nums text-[#f59e0b]">₹{formatAmount(inv.amount)}</span> via UPI
                                                </p>

                                                <div className="flex items-center border border-[#333] rounded overflow-hidden">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value="studio@upi"
                                                        className="bg-[#2a2a2a] w-full px-3 py-1.5 text-xs font-mono tabular-nums text-[#78716c] outline-none"
                                                    />
                                                    <button onClick={handleCopyUpi} className="px-3 py-1.5 text-xs font-medium bg-[#333] hover:bg-[#444] text-[#fafaf9] transition-colors border-l border-[#333]">
                                                        Copy
                                                    </button>
                                                </div>

                                                {inv.status !== "Paid" && (
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <button onClick={() => markPaid(inv.id)} className="text-xs font-medium text-[#78716c] hover:text-[#10b981] flex items-center gap-1 transition-colors group">
                                                            <CheckCircle2 className="w-3 h-3 group-hover:bg-[#10b981] group-hover:text-[#0f0f0f] rounded-full transition-colors" />
                                                            Manually Mark Paid
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Required style injection for the background green flash animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
        </div>
    )
}

function FileTextIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    )
}
