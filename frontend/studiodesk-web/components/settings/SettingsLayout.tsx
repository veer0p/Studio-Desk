"use client"

import { useState, useEffect } from "react"
import GeneralSettings from "./GeneralSettings"
import TeammatesSettings from "./TeammatesSettings"
import TaxSettings from "./TaxSettings"

type Tab = "GENERAL" | "TEAMMATES" | "BRANDING" | "TAX & GST" | "WORKFLOW"
const TABS: Tab[] = ["GENERAL", "TEAMMATES", "BRANDING", "TAX & GST", "WORKFLOW"]

export default function SettingsLayout() {
    const [activeTab, setActiveTab] = useState<Tab>("GENERAL")

    // Keyboard navigation and Cmd+S save intercept
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + S to trigger Save
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault()
                console.log("Global Save triggered from Settings")
                // Would typically dispatch a save action mapped across context here
                return
            }

            // Sidebar navigation via Up/Down arrow keys if in general body focus
            if (document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
                const curIdx = TABS.indexOf(activeTab)
                if (e.key === "ArrowDown" && curIdx < TABS.length - 1) {
                    e.preventDefault()
                    setActiveTab(TABS[curIdx + 1])
                } else if (e.key === "ArrowUp" && curIdx > 0) {
                    e.preventDefault()
                    setActiveTab(TABS[curIdx - 1])
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [activeTab])

    return (
        <div className="flex flex-col h-full bg-[#0f0f0f] text-[#fafaf9]">

            {/* Top Superior Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border/60 bg-[#1a1a1a]">
                <h1 className="font-mono text-sm tracking-widest uppercase font-bold text-[#fafaf9]">
                    STUDIO DESK <span className="text-border/60 mx-2">/</span> SETTINGS
                </h1>
                <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-mono text-[#78716c]">
                    <span>[ CMD+S TO SAVE ]</span>

                    {/* Fallback mouse actions */}
                    <div className="flex items-center gap-2 border-l border-border/60 pl-4 ml-2">
                        <button className="hover:text-[#fafaf9] transition-colors uppercase tracking-widest font-bold">Discard</button>
                        <button className="px-4 py-1.5 bg-[#fafaf9] text-black rounded-sm hover:bg-[#fafaf9]/90 transition-colors uppercase tracking-widest font-bold ml-2">
                            Save Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Architecture: mobile stacked, desktop side-by-side */}
            <div className="flex-1 grid md:grid-cols-[1fr_4fr] overflow-hidden">

                {/* Left Sidebar Pane - horizontal scroll on mobile, vertical on desktop */}
                <div className="border-b md:border-b-0 md:border-r border-border/60 flex md:flex-col flex-row p-4 md:p-6 gap-2 md:gap-2 bg-[#0a0a0a] overflow-x-auto md:overflow-y-auto snap-x snap-mandatory">
                    {TABS.map((tab) => {
                        const isActive = tab === activeTab
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-3 px-4 py-3 md:w-full w-auto text-left font-mono text-xs tracking-widest uppercase transition-colors whitespace-nowrap snap-center ${isActive ? "text-[#fafaf9]" : "text-[#78716c] hover:bg-muted/5 hover:text-[#fafaf9]"}`}
                            >
                                <div className="w-4 h-4 shrink-0 flex items-center justify-center border border-border/60">
                                    {isActive && <div className="w-2 h-2 bg-[#fafaf9]" />}
                                </div>
                                {tab}
                            </button>
                        )
                    })}
                </div>

                {/* Right Content Pane */}
                <div className="overflow-y-auto px-12 py-10 bg-[#0f0f0f]">
                    {activeTab === "GENERAL" && <GeneralSettings />}
                    {activeTab === "TEAMMATES" && <TeammatesSettings />}
                    {activeTab === "TAX & GST" && <TaxSettings />}
                    {/* Missing tabs mapped generally to an unimplemented blank state for this demo */}
                    {(activeTab === "BRANDING" || activeTab === "WORKFLOW") && (
                        <div className="text-[#78716c] font-mono text-xs uppercase tracking-widest uppercase">[ Module '{activeTab}' Under Construction ]</div>
                    )}
                </div>

            </div>
        </div>
    )
}
