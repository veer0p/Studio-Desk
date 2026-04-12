"use client"

import { useEffect, useRef } from "react"

interface LightningNodeProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LightningNode({ isOpen, onClose }: LightningNodeProps) {
    const nameInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
            // Auto focus primary input on open mimicking Spotlight
            setTimeout(() => {
                nameInputRef.current?.focus()
            }, 100)
        } else {
            document.body.style.overflow = "auto"
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose()
            }
        }
        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
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
            <div className="relative w-full max-w-xl bg-card border border-border/60 shadow-2xl rounded-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header Ribbon */}
                <div className="flex items-center px-6 py-4 border-b border-border/60 bg-muted/5">
                    <h2 className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                        Client <span className="text-border/60">/</span> <span className="text-foreground">Create</span>
                    </h2>
                </div>

                {/* Inputs Form taking Spotlight styling constraints */}
                <div className="flex flex-col p-6 gap-6 bg-card">

                    <div className="flex items-center gap-4 group">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground w-24 shrink-0 transition-colors group-focus-within:text-foreground">
                            NAME:
                        </label>
                        <input
                            ref={nameInputRef}
                            type="text"
                            placeholder="e.g. Acme Corp"
                            className="flex-1 bg-muted/5 border-0 border-b border-border/40 focus:border-foreground rounded-sm p-3 font-mono text-sm text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50 shadow-inner transition-all placeholder:text-muted-foreground/40"
                        />
                    </div>

                    <div className="flex items-center gap-4 group">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground w-24 shrink-0 transition-colors group-focus-within:text-foreground">
                            PHONE:
                        </label>
                        <input
                            type="tel"
                            placeholder="+91 99999 99999"
                            className="flex-1 bg-muted/5 border-0 border-b border-border/40 focus:border-foreground rounded-sm p-3 font-mono text-sm text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50 shadow-inner transition-all placeholder:text-muted-foreground/40"
                        />
                    </div>

                    <div className="flex items-center gap-4 group">
                        <label className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground w-24 shrink-0 transition-colors group-focus-within:text-foreground">
                            EMAIL:
                        </label>
                        <input
                            type="email"
                            placeholder="contact@acme.com"
                            className="flex-1 bg-muted/5 border-0 border-b border-border/40 focus:border-foreground rounded-sm p-3 font-mono text-sm text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-foreground/50 shadow-inner transition-all placeholder:text-muted-foreground/40"
                        />
                    </div>

                </div>

                {/* Footer Hint / Action Ribbon */}
                <div className="px-6 py-4 bg-muted/5 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
                        [ ESC TO CANCEL ]
                    </span>
                    <span className="text-[11px] uppercase tracking-widest font-bold text-foreground">
                        [ ↵ TO SAVE ]
                    </span>
                </div>

            </div>
        </div>
    )
}
