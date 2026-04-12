"use client"

import { useEffect } from "react"
import { Copy } from "lucide-react"

interface ClientProofingOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ClientProofingOverlay({ isOpen, onClose }: ClientProofingOverlayProps) {

    // Lightning Node Keyboard Behavior
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose()
        }
        if (isOpen) {
            document.body.style.overflow = "hidden"
            document.addEventListener("keydown", handleEsc)
        } else {
            document.body.style.overflow = "auto"
        }
        return () => {
            document.body.style.overflow = "auto"
            document.removeEventListener("keydown", handleEsc)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center font-sans px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal / Dialog Container */}
            <div className="relative w-full max-w-xl bg-[#0a0a0a] border border-border/60 shadow-2xl rounded-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header Ribbon */}
                <div className="flex items-center px-6 py-4 border-b border-border/60 bg-[#111]">
                    <h2 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                        Gallery <span className="text-border/60">/</span> <span className="text-foreground">Deliver</span>
                    </h2>
                </div>

                {/* Inputs Form */}
                <div className="flex flex-col p-6 gap-6 bg-[#050505]">

                    <div className="flex items-center gap-4 group relative">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-[#78716c] w-16 shrink-0">
                            URL:
                        </label>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                readOnly
                                value="studio-desk.com/johndoe/pin"
                                className="w-full bg-[#111] border border-border/40 focus:border-foreground rounded-sm p-3 pr-10 font-mono text-sm text-[#fafaf9] focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50 shadow-inner"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#fafaf9] transition-colors">
                                <span className="font-mono text-[10px] font-bold">[C]</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 group relative">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-[#78716c] w-16 shrink-0">
                            PIN:
                        </label>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                readOnly
                                value="4 0 5 9"
                                className="w-full bg-[#111] border border-border/40 focus:border-foreground rounded-sm p-3 pr-10 font-mono tabular-nums text-sm tracking-[0.5em] text-[#fafaf9] focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50 shadow-inner"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#fafaf9] transition-colors">
                                <span className="font-mono text-[10px] font-bold">[C]</span>
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-px bg-border/40 my-2" />

                    {/* Options */}
                    <div className="flex flex-col gap-4">
                        <span className="text-[11px] uppercase tracking-widest font-bold text-[#78716c]">OPTIONS:</span>

                        <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="w-4 h-4 rounded-xs border border-[#78716c] group-hover:border-[#fafaf9] bg-[#111] flex items-center justify-center transition-colors">
                                <div className="w-2 h-2 bg-[#fafaf9]" /> {/* Indicates Checked */}
                            </div>
                            <span className="font-mono text-sm tracking-wide text-[#fafaf9]">Allow High-Res Downloads</span>
                        </label>

                        <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="w-4 h-4 rounded-xs border border-[#78716c] group-hover:border-[#fafaf9] bg-[#111] flex items-center justify-center transition-colors">
                                {/* Empty */}
                            </div>
                            <span className="font-mono text-sm tracking-wide text-[#fafaf9]">Watermark Images</span>
                        </label>

                        <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="w-4 h-4 rounded-xs border border-[#78716c] group-hover:border-[#fafaf9] bg-[#111] flex items-center justify-center transition-colors">
                                <div className="w-2 h-2 bg-[#fafaf9]" /> {/* Indicates Checked */}
                            </div>
                            <span className="font-mono text-sm tracking-wide text-[#fafaf9]">Enable Favorites (Max: 100)</span>
                        </label>

                    </div>

                </div>

                {/* Footer Hint / Action Ribbon */}
                <div className="px-6 py-4 bg-[#111] border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest font-bold text-[#78716c]">
                        [ ESC TO CANCEL ]
                    </span>
                    <button className="text-[11px] uppercase tracking-widest font-bold text-black bg-[#fafaf9] px-4 py-1.5 rounded-sm hover:bg-[#fafaf9]/90 transition-colors flex items-center gap-2">
                        <Copy className="w-3.5 h-3.5" />
                        COPY TOTAL
                    </button>
                </div>

            </div>
        </div>
    )
}
