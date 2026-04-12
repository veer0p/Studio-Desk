"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"

export default function TaxSettings() {
    const [activeCombination, setActiveCombination] = useState("IGST18")

    const [hsnCodes, setHsnCodes] = useState([
        { id: 1, code: "9983", desc: "PHOTOGRAPHY SERVICES", rate: "18%" },
        { id: 2, code: "998314", desc: "ALBUM & PRINT PRODUCTION", rate: "12%" }
    ])

    // Simple key capture adding rows if hitting Tab on the very last rate input mimicking spreadsheet fluidity
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === "Tab" && !e.shiftKey && index === hsnCodes.length - 1) {
            e.preventDefault()
            setHsnCodes([...hsnCodes, { id: Date.now(), code: "", desc: "", rate: "" }])
        }
    }

    const handleUpdate = (id: number, field: string, value: string) => {
        setHsnCodes(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
    }

    return (
        <div className="flex flex-col h-full font-sans max-w-4xl">

            {/* Header and Integration Link perfectly horizontally apart */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#78716c]">
                    TAX & GST CONFIGURATION
                </h2>
                <button
                    className="flex items-center gap-2 px-4 py-1.5 border border-border/60 hover:bg-muted/5 text-[#fafaf9] font-bold text-[10px] uppercase tracking-widest rounded-xs transition-colors"
                >
                    Integrate ClearTax/Tally
                    <ExternalLink className="w-3 h-3 text-[#78716c]" />
                </button>
            </div>

            <div className="flex flex-col gap-10">

                {/* Global Taxation Combos */}
                <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#fafaf9] mb-4">
                        DEFAULT COMBINATIONS
                    </h3>
                    <div className="flex flex-col gap-3">
                        {[
                            { id: "IGST18", label: "18% IGST", note: "Out of state workflows" },
                            { id: "CGST_SGST", label: "9% CGST + 9% SGST", note: "In state workflows" },
                            { id: "ZERO", label: "ZERO RATED", note: "International workflows" }
                        ].map(combo => (
                            <label key={combo.id} className="flex items-center gap-4 cursor-pointer group w-fit">
                                <div className={`w-3.5 h-3.5 flex items-center justify-center border transition-colors ${activeCombination === combo.id ? "border-[#fafaf9]" : "border-[#78716c] group-hover:border-[#fafaf9]"}`}>
                                    {activeCombination === combo.id && <div className="w-1.5 h-1.5 bg-[#fafaf9]" />}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-sm tracking-wide font-bold text-[#fafaf9]">{combo.label}</span>
                                    <span className="font-mono text-xs tracking-wider text-[#78716c]">({combo.note})</span>
                                </div>
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={activeCombination === combo.id}
                                    onChange={() => setActiveCombination(combo.id)}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Dynamic Spreadsheeting Component */}
                <div>
                    <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#fafaf9] mb-4">
                        HSN CODES REPOSITORY
                    </h3>

                    <div className="border border-border/60 bg-[#111] rounded-sm overflow-hidden flex flex-col">

                        {/* Header */}
                        <div className="grid grid-cols-[1fr_3fr_1fr] border-b border-border/60 bg-[#0a0a0a]">
                            <div className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[#78716c]">CODE</div>
                            <div className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[#78716c] border-l border-border/60">DESCRIPTION</div>
                            <div className="px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-[#78716c] border-l border-border/60">DEFAULT RATE</div>
                        </div>

                        {/* Rows */}
                        <div className="flex flex-col">
                            {hsnCodes.map((hsn, index) => (
                                <div key={hsn.id} className="grid grid-cols-[1fr_3fr_1fr] border-b border-border/60 last:border-b-0 focus-within:bg-muted/5 group">
                                    <input
                                        value={hsn.code}
                                        onChange={(e) => handleUpdate(hsn.id, "code", e.target.value)}
                                        placeholder="e.g. 9983"
                                        className="px-4 py-3.5 font-mono text-sm tracking-widest font-semibold text-[#fafaf9] bg-transparent outline-none placeholder:text-[#78716c]/40"
                                    />
                                    <input
                                        value={hsn.desc}
                                        onChange={(e) => handleUpdate(hsn.id, "desc", e.target.value)}
                                        placeholder="PHOTOGRAPHY SERVICES"
                                        className="px-4 py-3.5 font-mono text-sm tracking-wide text-[#78716c] group-focus-within:text-[#fafaf9] bg-transparent outline-none border-l border-border/60 placeholder:text-[#78716c]/40 uppercase"
                                    />
                                    <input
                                        value={hsn.rate}
                                        onChange={(e) => handleUpdate(hsn.id, "rate", e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        placeholder="18%"
                                        className="px-4 py-3.5 font-mono text-sm tracking-widest font-bold text-[#10b981] bg-transparent outline-none border-l border-border/60 placeholder:text-[#78716c]/40 text-right"
                                    />
                                </div>
                            ))}
                        </div>

                    </div>

                    <p className="font-mono text-[10px] uppercase tracking-widest text-[#78716c] mt-4 ml-1 flex gap-2">
                        <span className="text-[#fafaf9] font-bold">[!]</span> Press TAB on the final rate cell to dynamically spawn subsequent ledger rows.
                    </p>

                </div>

            </div>
        </div>
    )
}
