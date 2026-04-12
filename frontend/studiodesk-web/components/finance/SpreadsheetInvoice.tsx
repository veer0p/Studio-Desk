"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mail, CheckCircle2, Copy } from "lucide-react"
import { format } from "date-fns"

interface LineItem {
    id: string;
    item: string;
    hsn: string;
    qty: number | "";
    rate: number | "";
    gstPercent: number;
}

export default function SpreadsheetInvoice() {
    const [clientInfo, setClientInfo] = useState({
        name: "John Doe",
        phone: "9876543210"
    })

    const [invoiceMeta, setInvoiceMeta] = useState({
        number: "INV-2024-089",
        date: format(new Date(), "MMM dd, yyyy"),
        dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "MMM dd, yyyy"),
    })

    const [items, setItems] = useState<LineItem[]>([
        { id: "1", item: "Wedding Package Gold", hsn: "9983", qty: 1, rate: 4500.00, gstPercent: 18 },
        { id: "2", item: "Drone Photography", hsn: "9983", qty: 1, rate: 1000.00, gstPercent: 18 },
        { id: "3", item: "", hsn: "", qty: "", rate: "", gstPercent: 0 },
    ])

    // Focus ref dictionary
    const cellRefs = useRef<Record<string, HTMLInputElement | null>>({})

    const formatAmount = (amt: number) => amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    const updateItem = (id: string, field: keyof LineItem, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value }

                // Auto-GST logic
                if (field === "item" && typeof value === "string") {
                    const lower = value.toLowerCase()
                    if (lower.includes("wedding") || lower.includes("shoot") || lower.includes("photo") || lower.includes("video")) {
                        updated.hsn = "9983"
                        updated.gstPercent = 18
                    }
                }
                return updated
            }
            return item
        }))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string, field: keyof LineItem, colIndex: number, rowIndex: number) => {
        if (e.key === "Tab") {
            // If we are tabbing off the very last cell of the very last row, add a new row
            if (rowIndex === items.length - 1 && field === "rate") {
                e.preventDefault()
                const newId = Math.random().toString(36).substr(2, 9)
                setItems(prev => [...prev, { id: newId, item: "", hsn: "", qty: "", rate: "", gstPercent: 0 }])

                // Delay to allow React to render the new row before focusing
                setTimeout(() => {
                    cellRefs.current[`${newId}-item`]?.focus()
                }, 50)
            }
        }
    }

    // Calculations
    const calculatedRows = items.map(line => {
        const qty = typeof line.qty === "number" ? line.qty : 0
        const rate = typeof line.rate === "number" ? line.rate : 0
        const baseAmount = qty * rate
        const totalGst = baseAmount * (line.gstPercent / 100)
        const amount = baseAmount + totalGst
        return { ...line, baseAmount, amount }
    })

    const subtotal = calculatedRows.reduce((sum, row) => sum + row.baseAmount, 0)
    const totalGst = calculatedRows.reduce((sum, row) => sum + (row.amount - row.baseAmount), 0)
    // Assuming intra-state (CGST/SGST split 50/50)
    const cgst = totalGst / 2
    const sgst = totalGst / 2
    const finalTotal = subtotal + totalGst

    return (
        <div className="flex flex-col h-full bg-[#0f0f0f] relative font-sans">

            {/* Scrollable Document Area */}
            <div className="flex-1 overflow-y-auto px-4 lg:px-12 py-8 pb-32">
                <div className="max-w-5xl mx-auto bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl overflow-hidden text-[#fafaf9]">

                    {/* Header */}
                    <div className="px-8 py-6 border-b border-[#333] flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 group">
                                <span className="text-[#78716c] font-medium uppercase tracking-wider text-xs">Client:</span>
                                <input
                                    type="text"
                                    value={clientInfo.name}
                                    onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-transparent border-b border-transparent hover:border-[#555] focus:border-[#f59e0b] focus:outline-none transition-colors px-1 py-0.5 text-base font-semibold"
                                />
                                <span className="text-[#78716c]">·</span>
                                <input
                                    type="text"
                                    value={clientInfo.phone}
                                    onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                                    className="bg-transparent border-b border-transparent hover:border-[#555] focus:border-[#f59e0b] focus:outline-none transition-colors px-1 py-0.5 font-mono text-sm tabular-nums"
                                />
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-[#78716c] font-medium uppercase tracking-wider text-xs mr-2">Date:</span>
                                <input
                                    type="text"
                                    value={invoiceMeta.date}
                                    onChange={(e) => setInvoiceMeta(prev => ({ ...prev, date: e.target.value }))}
                                    className="bg-transparent border-b border-transparent hover:border-[#555] focus:border-[#f59e0b] focus:outline-none transition-colors px-1 py-0.5 text-sm tabular-nums"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex items-center gap-1">
                                <span className="text-[#78716c] font-medium uppercase tracking-wider text-xs">Invoice #:</span>
                                <input
                                    type="text"
                                    value={invoiceMeta.number}
                                    onChange={(e) => setInvoiceMeta(prev => ({ ...prev, number: e.target.value }))}
                                    className="bg-transparent border-b border-transparent hover:border-[#555] focus:border-[#f59e0b] focus:outline-none transition-colors px-1 py-0.5 text-base font-semibold text-right tabular-nums text-[#f59e0b]"
                                />
                            </div>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="text-[#78716c] font-medium uppercase tracking-wider text-xs mr-2">Due Date:</span>
                                <input
                                    type="text"
                                    value={invoiceMeta.dueDate}
                                    onChange={(e) => setInvoiceMeta(prev => ({ ...prev, dueDate: e.target.value }))}
                                    className="bg-transparent border-b border-transparent hover:border-[#555] focus:border-[#f59e0b] focus:outline-none transition-colors px-1 py-0.5 text-sm tabular-nums text-right"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Spreadsheet Table */}
                    <div className="w-full">
                        <div className="grid grid-cols-[3fr_1fr_1fr_1.5fr_1fr_2fr] border-b border-[#333] bg-[#0f0f0f]/30">
                            {['ITEM', 'HSN', 'QTY', 'RATE', 'GST%', 'AMOUNT'].map(header => (
                                <div key={header} className="px-4 py-3 text-xs font-semibold text-[#78716c] tracking-wider uppercase text-left">
                                    {header}
                                </div>
                            ))}
                        </div>

                        <div className="bg-[#1a1a1a]">
                            {calculatedRows.map((row, index) => (
                                <div
                                    key={row.id}
                                    className="group relative grid grid-cols-[3fr_1fr_1fr_1.5fr_1fr_2fr] border-b border-[#222]"
                                >
                                    {/* Left amber highlight on hover to fulfill design mandate */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-transparent group-hover:bg-[#f59e0b] transition-colors" />

                                    {/* ITEM */}
                                    <input
                                        ref={(el) => { cellRefs.current[`${row.id}-item`] = el }}
                                        value={row.item}
                                        placeholder={index === items.length - 1 ? "Click to add new item..." : ""}
                                        onChange={(e) => updateItem(row.id, "item", e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, row.id, "item", 0, index)}
                                        className="w-full h-14 bg-transparent px-4 focus:bg-[#2a2a2a] hover:bg-[#2a2a2a]/50 outline-none focus:ring-1 focus:ring-inset focus:ring-[#f59e0b] transition-all text-sm font-medium"
                                    />
                                    {/* HSN */}
                                    <input
                                        value={row.hsn}
                                        onChange={(e) => updateItem(row.id, "hsn", e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, row.id, "hsn", 1, index)}
                                        className="w-full h-14 bg-transparent px-4 focus:bg-[#2a2a2a] hover:bg-[#2a2a2a]/50 outline-none focus:ring-1 focus:ring-inset focus:ring-[#f59e0b] transition-all font-mono tabular-nums text-sm text-[#78716c] focus:text-[#fafaf9]"
                                    />
                                    {/* QTY */}
                                    <input
                                        type="number"
                                        value={row.qty === "" ? "" : row.qty}
                                        onChange={(e) => updateItem(row.id, "qty", e.target.value === "" ? "" : Number(e.target.value))}
                                        onKeyDown={(e) => handleKeyDown(e, row.id, "qty", 2, index)}
                                        className="w-full h-14 bg-transparent px-4 focus:bg-[#2a2a2a] hover:bg-[#2a2a2a]/50 outline-none focus:ring-1 focus:ring-inset focus:ring-[#f59e0b] transition-all font-mono tabular-nums text-sm"
                                    />
                                    {/* RATE */}
                                    <input
                                        ref={(el) => { cellRefs.current[`${row.id}-rate`] = el }}
                                        type="number"
                                        value={row.rate === "" ? "" : row.rate}
                                        onChange={(e) => updateItem(row.id, "rate", e.target.value === "" ? "" : Number(e.target.value))}
                                        onKeyDown={(e) => handleKeyDown(e, row.id, "rate", 3, index)}
                                        className="w-full h-14 bg-transparent px-4 focus:bg-[#2a2a2a] hover:bg-[#2a2a2a]/50 outline-none focus:ring-1 focus:ring-inset focus:ring-[#f59e0b] transition-all font-mono tabular-nums text-sm"
                                    />
                                    {/* GST */}
                                    <div className="flex items-center px-4 font-mono tabular-nums text-sm text-[#78716c]">
                                        <select
                                            value={row.gstPercent}
                                            onChange={(e) => updateItem(row.id, "gstPercent", Number(e.target.value))}
                                            className="bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-[#f59e0b] p-1 rounded hover:bg-[#2a2a2a] appearance-none"
                                        >
                                            <option value={0} className="bg-[#1a1a1a]">0</option>
                                            <option value={5} className="bg-[#1a1a1a]">5</option>
                                            <option value={12} className="bg-[#1a1a1a]">12</option>
                                            <option value={18} className="bg-[#1a1a1a]">18</option>
                                        </select>
                                    </div>
                                    {/* AMOUNT */}
                                    <div className="flex items-center justify-end px-6 font-mono tabular-nums font-semibold text-[#fafaf9] pointer-events-none">
                                        {row.amount > 0 ? formatAmount(row.amount) : "—"}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals Section */}
                        <div className="w-full flex justify-end px-6 py-8 border-t border-[#333] bg-[#0fa0fa]/[0.01]">
                            <div className="w-80 flex flex-col gap-3 font-mono tabular-nums text-sm">
                                <div className="flex justify-between items-center text-[#78716c]">
                                    <span className="uppercase tracking-widest text-xs font-sans font-semibold">Subtotal:</span>
                                    <span>{formatAmount(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#78716c]">
                                    <span className="uppercase tracking-widest text-xs font-sans font-semibold">CGST (9%):</span>
                                    <span>{formatAmount(cgst)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#78716c]">
                                    <span className="uppercase tracking-widest text-xs font-sans font-semibold">SGST (9%):</span>
                                    <span>{formatAmount(sgst)}</span>
                                </div>
                                <div className="h-px w-full bg-[#333] my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="uppercase tracking-widest text-xs font-sans font-semibold text-[#fafaf9]">Total:</span>
                                    <span className="text-lg font-bold text-[#fafaf9]">{formatAmount(finalTotal)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Floating Sticky Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#0f0f0f]/80 backdrop-blur-md border-t border-[#333] flex items-center justify-center pointer-events-none">
                <div className="flex gap-4 pointer-events-auto shadow-2xl p-2 rounded-xl bg-[#1a1a1a] border border-[#333]">
                    <button className="h-10 px-5 flex items-center gap-2 bg-[#f59e0b] hover:bg-[#d97706] text-[#0f0f0f] font-semibold text-sm rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f59e0b] focus:ring-offset-[#1a1a1a]">
                        {/* Sends directly across WhatsApp immediately minimizing interactions */}
                        <Send className="w-4 h-4" />
                        Send via WhatsApp
                    </button>

                    <button className="h-10 px-4 flex items-center gap-2 bg-transparent hover:bg-[#333] text-[#fafaf9] text-sm font-medium rounded-lg transition-colors">
                        <Mail className="w-4 h-4 text-[#78716c]" />
                        Email PDF
                    </button>

                    <div className="w-px h-6 bg-[#333] my-auto mx-1" />

                    <button className="h-10 px-4 flex items-center gap-2 bg-transparent hover:bg-emerald-500/10 hover:text-emerald-500 text-[#fafaf9] text-sm font-medium rounded-lg transition-colors group">
                        <CheckCircle2 className="w-4 h-4 text-[#78716c] group-hover:text-emerald-500 transition-colors" />
                        Mark Paid
                    </button>

                    <button className="h-10 px-4 flex items-center gap-2 bg-transparent hover:bg-[#333] text-[#fafaf9] text-sm font-medium rounded-lg transition-colors">
                        <Copy className="w-4 h-4 text-[#78716c]" />
                        Duplicate
                    </button>
                </div>
            </div>

        </div>
    )
}
