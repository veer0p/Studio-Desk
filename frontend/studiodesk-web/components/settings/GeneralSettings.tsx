"use client"

import { useState } from "react"

export default function GeneralSettings() {
    const [preferences, setPreferences] = useState({
        emailConfirmations: true,
        autoArchive: false,
    })

    return (
        <div className="flex flex-col max-w-2xl font-sans">

            <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#78716c] mb-6">
                GENERAL CONFIGURATION
            </h2>

            <div className="flex flex-col gap-6">

                <div className="flex items-center gap-4 group">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#78716c] w-32 shrink-0 transition-colors group-focus-within:text-[#fafaf9]">
                        STUDIO NAME:
                    </label>
                    <input
                        type="text"
                        defaultValue="Acorn Photography"
                        className="flex-1 bg-muted/5 border-0 border-b border-border/40 focus:border-[#fafaf9] rounded-sm p-3 font-mono text-sm text-[#fafaf9] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#fafaf9]/50 shadow-inner transition-all placeholder:text-[#78716c]"
                    />
                </div>

                <div className="flex items-center gap-4 group">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-[#78716c] w-32 shrink-0 transition-colors group-focus-within:text-[#fafaf9]">
                        CURRENCY:
                    </label>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            defaultValue="USD ($)"
                            disabled
                            className="w-full bg-[#111] border border-border/40 focus:border-[#fafaf9] rounded-sm p-3 font-mono text-sm text-[#78716c] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#fafaf9]/50 opacity-80"
                        />
                    </div>
                </div>

            </div>

            <div className="w-full h-px bg-border/40 my-10" />

            <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#78716c] mb-6">
                PREFERENCES
            </h2>

            <div className="flex flex-col gap-4">

                {/* Artisan Checkbox Toggles */}
                <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-xs border transition-colors flex items-center justify-center ${preferences.emailConfirmations ? "bg-[#fafaf9] border-[#fafaf9]" : "bg-transparent border-[#78716c] group-hover:border-[#fafaf9]"}`}>
                        {preferences.emailConfirmations && <div className="w-2 h-2 bg-black" />}
                    </div>
                    <span className="font-mono text-sm tracking-wide text-[#fafaf9]">Email confirmations on new bookings</span>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={preferences.emailConfirmations}
                        onChange={(e) => setPreferences(prev => ({ ...prev, emailConfirmations: e.target.checked }))}
                    />
                </label>

                <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-xs border transition-colors flex items-center justify-center ${preferences.autoArchive ? "bg-[#fafaf9] border-[#fafaf9]" : "bg-transparent border-[#78716c] group-hover:border-[#fafaf9]"}`}>
                        {preferences.autoArchive && <div className="w-2 h-2 bg-black" />}
                    </div>
                    <span className="font-mono text-sm tracking-wide text-[#fafaf9]">Auto-archive galleries past 6 months</span>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={preferences.autoArchive}
                        onChange={(e) => setPreferences(prev => ({ ...prev, autoArchive: e.target.checked }))}
                    />
                </label>

            </div>
        </div>
    )
}
