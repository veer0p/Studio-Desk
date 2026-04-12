"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import MissionControl from "@/components/crm/MissionControl"
import LightningNode from "@/components/crm/LightningNode"

// Mock Artisan UI Data
const mockClients = [
    { id: "1", name: "JOHN DOE", spend: 4500, lastBooking: "OCT 12, 2024", status: "ACTIVE" },
    { id: "2", name: "ALICE M.", spend: 1200, lastBooking: "OCT 10, 2024", status: "INACTIVE" },
    { id: "3", name: "SMITH WEDDINGS", spend: 8000, lastBooking: "SEP 05, 2024", status: "VIP" },
]

export default function ClientDirectory() {
    const [search, setSearch] = useState("")
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
    const [isLightingNodeOpen, setIsLightingNodeOpen] = useState(false)

    // Listen for 'C' to open Lightning Node or Cmd+K / '/' for search
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Cmd+K or / to focus search (we just focus a ref if we had one, or open modal)
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                document.getElementById("artisan-search-input")?.focus()
            } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
                e.preventDefault()
                document.getElementById("artisan-search-input")?.focus()
            } else if (e.key.toLowerCase() === "c" && document.activeElement?.tagName !== "INPUT") {
                e.preventDefault()
                setIsLightingNodeOpen(true)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const filtered = mockClients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

    const formatAmount = (amt: number) => amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    return (
        <div className="flex flex-col h-full bg-background text-foreground font-sans">

            {/* Top Header - Artisan Design */}
            <div className="flex flex-col md:flex-row items-center justify-between px-8 py-6 border-b border-border/60 gap-4">

                {/* Search Input imitating Spotlight/CmdK */}
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-70" />
                    <input
                        id="artisan-search-input"
                        type="text"
                        placeholder="Cmd+K or / to search clients..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md border-border/60 bg-muted/10 focus:outline-none focus:ring-1 focus:ring-foreground/50 transition-all font-mono text-sm placeholder:text-muted-foreground/60"
                    />
                </div>

                {/* Primary CTA Inversion Button */}
                <button
                    onClick={() => setIsLightingNodeOpen(true)}
                    className="w-full md:w-auto px-6 py-2 bg-foreground text-background font-bold text-[11px] uppercase tracking-widest rounded-md hover:bg-foreground/90 transition-colors shadow-sm"
                >
                    + New Client
                </button>

            </div>

            {/* Main Table - Precision Geometry */}
            <div className="flex-1 overflow-y-auto px-8 py-6">

                <div className="border border-border/60 rounded-md overflow-hidden bg-card shadow-sm">

                    <div className="grid grid-cols-[3fr_2fr_2fr_1.5fr] border-b border-border/60 bg-muted/5">
                        {['NAME', 'TOTAL SPEND', 'LAST BOOKING', 'STATUS'].map(header => (
                            <div key={header} className="px-6 py-3 text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
                                {header}
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col">
                        {filtered.map(client => (
                            <div
                                key={client.id}
                                onClick={() => setSelectedClientId(client.id)}
                                className="grid grid-cols-[3fr_2fr_2fr_1.5fr] border-b border-border/60 last:border-b-0 hover:bg-muted/10 transition-colors cursor-pointer"
                            >
                                <div className="px-6 py-4 flex items-center font-mono text-sm font-semibold tracking-wide">
                                    {client.name}
                                </div>
                                <div className="px-6 py-4 flex items-center font-mono text-sm tracking-wider">
                                    $ {formatAmount(client.spend)}
                                </div>
                                <div className="px-6 py-4 flex items-center font-mono text-sm tracking-wider text-muted-foreground">
                                    {client.lastBooking}
                                </div>
                                <div className="px-6 py-4 flex items-center">
                                    {/* Status Node with Geometry */}
                                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-sm border border-border/60 bg-background w-fit`}>
                                        <div className="w-1.5 h-1.5 bg-foreground" />
                                        <span className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">
                                            {client.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <div className="px-6 py-12 text-center flex flex-col items-center">
                                <span className="font-mono text-sm text-muted-foreground tracking-widest uppercase">No Clients Found</span>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Overlays */}
            <MissionControl
                clientId={selectedClientId}
                onClose={() => setSelectedClientId(null)}
            />

            <LightningNode
                isOpen={isLightingNodeOpen}
                onClose={() => setIsLightingNodeOpen(false)}
            />

        </div>
    )
}
