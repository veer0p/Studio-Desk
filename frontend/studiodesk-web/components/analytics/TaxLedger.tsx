"use client"

import { Printer } from "lucide-react"

export default function TaxLedger() {

    const handlePrint = () => {
        // Uses CSS @media print natively, completely bypassing server side PDF generators
        window.print()
    }

    return (
        <div className="bg-[#111] border border-border/60 flex flex-col w-full mt-8 font-sans">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/60">
                <h2 className="font-mono text-[11px] font-bold tracking-widest text-[#fafaf9] uppercase">
                    TAX LEDGER (H2 2024)
                </h2>

                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 hover:text-[#fafaf9] text-[#78716c] transition-colors uppercase tracking-widest font-bold text-[10px]"
                >
                    <Printer className="w-3.5 h-3.5" />
                    [ GENERATE PDF ]
                </button>
            </div>

            {/* Grid Container avoiding alternating zebra backgrounds */}
            <div className="flex flex-col w-full">

                <div className="grid grid-cols-[1fr_1.5fr_2.5fr_1.5fr_1.5fr] px-6 py-4 border-b border-border/60 bg-[#0a0a0a]">
                    {['DATE', 'INVOICE', 'CLIENT', 'TAX TYPE'].map(h => (
                        <span key={h} className="text-[10px] uppercase tracking-widest font-bold text-[#78716c]">{h}</span>
                    ))}
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#78716c] text-right">LIABILITY</span>
                </div>

                {/* Dense Rows */}
                <div className="flex flex-col">
                    {[
                        { date: "OCT 12", inv: "INV-0089", client: "JOHN DOE", tax: "18% IGST", val: "810.00" },
                        { date: "OCT 05", inv: "INV-0088", client: "ALICE M.", tax: "9% CG+SG", val: "216.00" },
                        { date: "SEP 14", inv: "INV-0087", client: "SMITH WEDDINGS", tax: "ZERO RATED", val: "0.00" },
                    ].map((r, i) => (
                        <div key={i} className="grid grid-cols-[1fr_1.5fr_2.5fr_1.5fr_1.5fr] px-6 py-4 border-b border-border/40 hover:bg-muted/5 transition-colors">
                            <span className="font-mono text-xs font-semibold text-[#fafaf9] tracking-wider">{r.date}</span>
                            <span className="font-mono text-xs text-[#78716c] tracking-widest uppercase">{r.inv}</span>
                            <span className="font-mono text-xs font-bold text-[#fafaf9] lowercase" style={{ fontVariant: "small-caps" }}>{r.client}</span>
                            <span className="font-mono text-[10px] font-bold tracking-widest text-[#78716c] uppercase pt-0.5">{r.tax}</span>
                            <span className="font-mono text-xs tabular-nums tracking-widest font-medium text-[#fafaf9] text-right">$ {r.val.padStart(8, '\u00A0')}</span>
                        </div>
                    ))}
                </div>

                {/* Subtotal Aggregate row defined by strict heavy top border */}
                <div className="grid grid-cols-[6fr_1.5fr] px-6 py-5 border-t border-border/60 bg-muted/10">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#fafaf9]">
                        TOTAL LIABILITY AGGREGATE
                    </span>
                    <span className="font-mono text-sm tabular-nums tracking-widest font-bold text-[#fafaf9] text-right">
                        $  1026.00
                    </span>
                </div>

            </div>
        </div>
    )
}
