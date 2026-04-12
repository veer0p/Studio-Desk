"use client"

import { useState } from "react"
import LightningNode from "@/components/crm/LightningNode"

type RoleAccess = "ALL" | "READ" | "GALLERY"

const ACCESS_CYCLE: Record<RoleAccess, RoleAccess> = {
    "ALL": "READ",
    "READ": "GALLERY",
    "GALLERY": "ALL"
}

export default function TeammatesSettings() {
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [teammates, setTeammates] = useState([
        { id: 1, name: "JANE DOE", email: "jane@acme.com", role: "ADMIN", access: "ALL" as RoleAccess },
        { id: 2, name: "MARK T.", email: "mark@acme.com", role: "SHOOTER", access: "READ" as RoleAccess },
        { id: 3, name: "SARAH J.", email: "sarah@acme.com", role: "EDITOR", access: "GALLERY" as RoleAccess },
    ])

    const toggleAccess = (id: number) => {
        setTeammates(prev => prev.map(t =>
            t.id === id ? { ...t, access: ACCESS_CYCLE[t.access] } : t
        ))
    }

    return (
        <div className="flex flex-col h-full font-sans max-w-4xl">

            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[11px] uppercase tracking-widest font-bold text-[#78716c]">
                    TEAMMATES & ROLES
                </h2>
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="px-6 py-2 bg-transparent border border-border/60 hover:bg-[#fafaf9] hover:text-black hover:border-[#fafaf9] text-[#fafaf9] font-bold text-[11px] uppercase tracking-widest rounded-sm transition-colors"
                >
                    + Invite Member
                </button>
            </div>

            <div className="border border-border/60 bg-[#111] rounded-sm overflow-hidden flex flex-col">

                {/* Table Header */}
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr] border-b border-border/60 bg-[#0a0a0a]">
                    {['NAME', 'EMAIL', 'ROLE', 'ACCESS'].map(header => (
                        <div key={header} className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-[#78716c]">
                            {header}
                        </div>
                    ))}
                </div>

                {/* Teammates List */}
                <div className="flex flex-col">
                    {teammates.map(t => (
                        <div key={t.id} className="grid grid-cols-[2fr_2fr_1fr_1fr] border-b border-border/60 last:border-b-0 hover:bg-muted/5 transition-colors group">
                            <div className="px-6 py-4 font-mono text-sm tracking-wide font-semibold text-[#fafaf9] flex items-center">
                                {t.name}
                            </div>
                            <div className="px-6 py-4 font-mono text-xs tracking-wider text-[#78716c] flex items-center group-hover:text-[#fafaf9] transition-colors">
                                {t.email}
                            </div>
                            <div className="px-6 py-4 flex items-center">
                                <span className="text-[10px] uppercase tracking-widest font-mono text-[#fafaf9] px-2 py-1 border border-border/40 rounded-xs">
                                    {t.role}
                                </span>
                            </div>
                            <div className="px-6 py-4 flex items-center">
                                <button
                                    onClick={() => toggleAccess(t.id)}
                                    className="text-[10px] uppercase tracking-widest font-mono font-bold text-black bg-[#fafaf9] px-3 py-1.5 rounded-xs border border-[#fafaf9] hover:bg-transparent hover:text-[#fafaf9] transition-colors"
                                >
                                    [ {t.access} ]
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* We reuse the Component F Lightning node variant here for demo purposes rather than coding an exact duplicate invite dialog for brevity */}
            <LightningNode
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
            />

        </div>
    )
}
