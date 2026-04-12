"use client"

import { X } from "lucide-react"
import { useEffect } from "react"

interface MissionControlProps {
    clientId: string | null;
    onClose: () => void;
}

export default function MissionControl({ clientId, onClose }: MissionControlProps) {

    // Prevent body scroll when open (optional)
    useEffect(() => {
        if (clientId) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
    }, [clientId])

    const isOpen = clientId !== null

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Slide-over panel */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-[900px] border-l border-border/60 bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"} flex flex-col font-sans`}>

                {/* Superior Header row with explicit close layout */}
                <div className="flex items-start justify-between px-10 py-10 pb-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-mono text-3xl font-bold tracking-widest text-foreground uppercase">JOHN DOE</h1>
                        <div className="flex items-center gap-4 text-sm font-mono tracking-wider text-muted-foreground mt-2">
                            <span>+91 98765 43210</span>
                            <span className="text-border/60">|</span>
                            <span>john@example.com</span>
                            <span className="text-border/60">|</span>
                            <span className="text-foreground font-semibold">LTV: $ 4,500.00</span>
                        </div>
                    </div>

                    <button onClick={onClose} className="p-2 border border-border/60 rounded-md hover:bg-muted/10 transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Stacked Actions Dedicated Row strictly beneath (No floating over controls) */}
                <div className="px-10 pb-8 border-b border-border/60 flex items-center gap-3">
                    <button className="px-4 py-1.5 border border-border/60 rounded-md text-[11px] uppercase tracking-widest font-bold text-foreground hover:bg-muted/10 transition-colors">
                        Edit Details
                    </button>
                    <button className="px-4 py-1.5 border border-border/60 rounded-md text-[11px] uppercase tracking-widest font-bold text-foreground hover:bg-muted/10 transition-colors">
                        Message
                    </button>
                    <button className="px-4 py-1.5 bg-foreground text-background rounded-md text-[11px] uppercase tracking-widest font-bold hover:bg-foreground/90 shadow-sm transition-colors ml-auto">
                        + New Booking
                    </button>
                </div>

                {/* Dense Content Scroll Area */}
                <div className="flex-1 overflow-y-auto px-10 py-10 flex flex-col gap-12">

                    {/* Timeline Section */}
                    <div>
                        <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-6">TIMELINE</h3>

                        <div className="flex flex-col">
                            {/* Event 1 */}
                            <div className="flex gap-4 min-h-[64px]">
                                <div className="flex flex-col items-center">
                                    <div className="w-3.5 h-3.5 bg-foreground text-background rounded-xs border border-foreground flex items-center justify-center shrink-0 mt-0.5">
                                        {/* Active/Completed filled geometric node */}
                                        <div className="w-1.5 h-1.5 bg-background rounded-sm" />
                                    </div>
                                    <div className="w-px h-full bg-border/60 my-1 group-last:hidden" />
                                </div>
                                <div className="flex flex-col pb-6">
                                    <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">OCT 12</span>
                                    <span className="font-mono text-sm font-semibold tracking-wide mt-1">WEDDING PACKAGE DELIVERED</span>
                                </div>
                            </div>

                            {/* Event 2 */}
                            <div className="flex gap-4 min-h-[64px]">
                                <div className="flex flex-col items-center">
                                    <div className="w-3.5 h-3.5 bg-foreground text-background rounded-xs border border-foreground flex items-center justify-center shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-background rounded-sm" />
                                    </div>
                                    <div className="w-px h-full bg-border/60 my-1 group-last:hidden" />
                                </div>
                                <div className="flex flex-col pb-6">
                                    <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">SEP 01</span>
                                    <span className="font-mono text-sm font-semibold tracking-wide mt-1">INQUIRY RECEIVED</span>
                                </div>
                            </div>

                            {/* Event 3 (Pending empty node) */}
                            <div className="flex gap-4 min-h-[64px] opacity-60">
                                <div className="flex flex-col items-center">
                                    <div className="w-3.5 h-3.5 bg-background rounded-xs border border-border flex items-center justify-center shrink-0 mt-0.5" />
                                    <div className="w-px h-full bg-border/40 my-1 hidden" />
                                </div>
                                <div className="flex flex-col pb-6">
                                    <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">JUN 14</span>
                                    <span className="font-mono text-sm font-semibold tracking-wide mt-1">ENGAGEMENT SHOOT COMPLETED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Files & Contracts Section */}
                    <div>
                        <h3 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground mb-6">FILES & CONTRACTS</h3>
                        <div className="flex flex-col gap-3">

                            <div className="flex items-center gap-4 p-3 border border-border/60 rounded-md hover:bg-muted/10 transition-colors cursor-pointer group">
                                <div className="px-2 py-1 text-[10px] font-bold tracking-widest uppercase bg-muted/20 text-muted-foreground rounded-sm border border-border/40 group-hover:border-border/60">
                                    DOC
                                </div>
                                <span className="font-mono text-sm font-semibold tracking-wide text-foreground">ENGAGEMENT_CONTRACT.PDF</span>
                            </div>

                            <div className="flex items-center gap-4 p-3 border border-border/60 rounded-md hover:bg-muted/10 transition-colors cursor-pointer group">
                                <div className="px-2 py-1 text-[10px] font-bold tracking-widest uppercase bg-muted/20 text-muted-foreground rounded-sm border border-border/40 group-hover:border-border/60">
                                    DOC
                                </div>
                                <span className="font-mono text-sm font-semibold tracking-wide text-foreground">WEDDING_INVOICE_089.PDF</span>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}
