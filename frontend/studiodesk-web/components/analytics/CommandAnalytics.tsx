"use client"

import { Download } from "lucide-react"
import TaxLedger from "./TaxLedger"

export default function CommandAnalytics() {

    // Generating a mocked sharp SVG path leveraging raw miter joins matching the Artisan lens-blade constraint
    // In a real app this path translates exact Y scalar data out of backend arrays.
    const chartPath = "M 0 150 L 50 140 L 100 160 L 150 110 L 200 130 L 250 80 L 300 90 L 350 40 L 400 50 L 450 15 L 500 30 L 550 5 L 600 20 L 700 0 L 800 40 L 900 10 L 1000 60 L 1100 0"

    const handleExport = () => {
        // Immediate mock export eliminating "Please Wait/Email" loops.
        console.log("Exporting CSV Payload Natively")
    }

    return (
        <div className="flex flex-col h-full bg-[#0f0f0f] text-[#fafaf9] font-sans overflow-y-auto">

            {/* Top Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border/60 bg-[#1a1a1a]">
                <h1 className="font-mono text-sm tracking-widest uppercase font-bold text-[#fafaf9]">
                    STUDIO DESK <span className="text-border/60 mx-2">/</span> ANALYTICS
                </h1>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 hover:text-[#fafaf9] text-[#78716c] transition-colors uppercase tracking-widest font-bold text-[10px]"
                    >
                        <Download className="w-3.5 h-3.5" />
                        [ EXPORT CSV ]
                    </button>
                    <div className="w-px h-4 bg-border/60 mx-2" />
                    <button className="text-[10px] bg-muted/5 font-bold tracking-widest uppercase opacity-70 hover:opacity-100 transition-opacity">
                        [ THIS MONTH ]
                    </button>
                    <button className="text-[10px] font-bold tracking-widest uppercase text-black bg-[#fafaf9] px-3 py-1 rounded-sm shadow-sm transition-opacity">
                        [ THIS YEAR ]
                    </button>
                </div>
            </div>

            <div className="p-8 flex flex-col gap-8 max-w-6xl w-full mx-auto">

                {/* Massive Scale Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="bg-[#111] border border-border/60 p-8 flex flex-col gap-2">
                        <span className="font-mono text-[11px] font-bold tracking-widest text-[#78716c] uppercase">
                            REVENUE VELOCITY (YTD)
                        </span>
                        <div className="flex items-end gap-6 mt-4">
                            <span className="font-mono text-5xl tracking-tighter tabular-nums font-medium text-[#fafaf9]">
                                $ 124,500.00
                            </span>
                            <span className="font-mono text-xl tracking-widest font-bold text-[#10b981] mb-1">
                                [+ 14%]
                            </span>
                        </div>
                    </div>

                    <div className="bg-[#111] border border-border/60 p-8 flex flex-col gap-2">
                        <span className="font-mono text-[11px] font-bold tracking-widest text-[#78716c] uppercase">
                            OUTSTANDING BILLING
                        </span>
                        <div className="flex items-end gap-6 mt-4">
                            <span className="font-mono text-5xl tracking-tighter tabular-nums font-medium text-amber-500">
                                $ 12,400.00
                            </span>
                            <span className="font-mono text-sm tracking-widest font-bold text-[#78716c] mb-2">
                                [3 CLIENTS]
                            </span>
                        </div>
                    </div>

                </div>

                {/* Aggressive SVG Timeline Graph entirely ignoring Charting Libraries */}
                <div className="bg-[#111] border border-border/60 p-8 h-[400px] flex flex-col relative w-full mt-4">

                    {/* Grid Y Axis Tags */}
                    <div className="absolute left-8 top-8 bottom-16 flex flex-col justify-between font-mono text-[10px] text-[#78716c] font-bold uppercase tracking-widest z-10">
                        <div className="flex items-center gap-3">
                            <span>[■] $20K</span>
                            <div className="w-full h-px bg-border/20 absolute left-20 right-0" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span>[ ] $10K</span>
                            <div className="w-full h-px bg-border/20 absolute left-20 right-0" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span>[ ] $0</span>
                            <div className="w-full h-px bg-border/20 absolute left-20 right-0" />
                        </div>
                    </div>

                    {/* Core SVG Renderer mapping stroke-miterlimit rendering sharp jagged graphs perfectly avoiding vector smoothing */}
                    <div className="absolute left-28 right-8 top-12 bottom-16 overflow-hidden">
                        <svg
                            viewBox="0 0 1100 180"
                            preserveAspectRatio="none"
                            className="w-full h-full"
                        >
                            {/* Underfill Gradient mapped to monotone opacity scaling */}
                            <defs>
                                <linearGradient id="monoFade" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#fafaf9" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="#fafaf9" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            <path
                                d={`${chartPath} L 1100 180 L 0 180 Z`}
                                fill="url(#monoFade)"
                            />

                            <path
                                d={chartPath}
                                fill="none"
                                stroke="#fafaf9"
                                strokeWidth="2"
                                strokeLinejoin="miter"
                                strokeMiterlimit="4"
                            />

                            {/* Current active month indicator line */}
                            <line x1="900" y1="0" x2="900" y2="180" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
                        </svg>
                    </div>

                    {/* X Axis Timeline */}
                    <div className="absolute bottom-8 left-28 right-8 flex justify-between font-mono text-[10px] text-[#78716c] font-bold uppercase tracking-widest border-t border-border/40 pt-4">
                        {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((m) => (
                            <span key={m}>{m}</span>
                        ))}
                    </div>
                </div>

                {/* Append Page N Tax Ledger right below the core timeline arrays */}
                <TaxLedger />

            </div>
        </div>
    )
}
