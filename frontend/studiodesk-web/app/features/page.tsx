import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function FeaturesPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Narrative Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-4xl">
                    Features built for the <span className="text-[#f59e0b]">darkroom</span>, not the boardroom.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mt-4">
                    Every tool in Studio-Desk was designed to eliminate the administrative friction that prevents you from shooting. No buzzwords, just brutal operational efficiency.
                </p>
            </section>

            {/* Feature 1: Kanban Booking System */}
            <section className="py-24 max-w-7xl mx-auto px-6 border-y border-white/5 bg-[#1A1D27]/30">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    <div className="lg:w-1/2 space-y-6">
                        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[10px] uppercase tracking-widest text-[#f59e0b]">
                            1. The Kanban Booking System
                        </div>
                        <h2 className="font-serif text-4xl text-white">Never double-book a lens again.</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Managing multiple shoots spread across different cities requires precision. Traditional calendars fail because they don't track the *status* of an event, only the date.
                        </p>
                        <ul className="space-y-4 font-mono text-xs tracking-wide text-gray-300 pt-4">
                            <li className="flex items-start gap-4">
                                <span className="text-[#f59e0b] text-base leading-none mt-0.5">■</span>
                                <span><strong>Drag & Drop Status:</strong> Move events from 'Lead' to 'Advance Paid' to 'Shooting' to 'Editing Phase'.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="text-[#f59e0b] text-base leading-none mt-0.5">■</span>
                                <span><strong>Equipment Conflict Prevention:</strong> If the 70-200mm lens is booked for a Saturday shoot in Pune, it physically cannot be assigned to the Sunday shoot in Mumbai.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="text-[#f59e0b] text-base leading-none mt-0.5">■</span>
                                <span><strong>Automated Triggers:</strong> Moving a card to "Editing Phase" automatically pauses WhatsApp payment collection bots until delivery.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 w-full p-6 bg-[#0f1117] border border-white/10 rounded-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#f59e0b]/50 to-transparent"></div>
                        {/* Mock Kanban */}
                        <div className="flex gap-4 overflow-hidden">
                            <div className="w-48 bg-[#1A1D27] p-3 rounded-sm space-y-4 border border-white/5">
                                <h4 className="font-mono text-[10px] uppercase text-gray-500 tracking-widest pb-2 border-b border-white/5">Advance Paid (2)</h4>
                                <div className="bg-[#0f1117] border border-success/30 p-3 rounded-sm space-y-2">
                                    <p className="font-mono text-xs text-white">Mehta Wedding</p>
                                    <p className="font-mono text-[9px] text-success uppercase">₹50k UPI Cleared</p>
                                </div>
                            </div>
                            <div className="w-48 bg-[#1A1D27] p-3 rounded-sm space-y-4 border border-white/5">
                                <h4 className="font-mono text-[10px] uppercase text-gray-500 tracking-widest pb-2 border-b border-white/5">Post-Production (1)</h4>
                                <div className="bg-[#0f1117] border border-[#f59e0b]/50 p-3 rounded-sm space-y-2 translate-y-4 shadow-xl">
                                    <p className="font-mono text-xs text-white">Rahul Pre-Wedding</p>
                                    <p className="font-mono text-[9px] text-[#f59e0b] uppercase">Editing: 70%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature 2: Spreadsheet Invoicing */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
                    <div className="lg:w-1/2 space-y-6">
                        <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[10px] uppercase tracking-widest text-[#f59e0b]">
                            2. Spreadsheet-Style Quoting
                        </div>
                        <h2 className="font-serif text-4xl text-white">Build 5-page quotes as fast as typing in Excel.</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            No more fighting with clunky web forms or misaligned PDF generators. If you know how to use an Excel sheet, you already know how to build a Studio-Desk quote.
                        </p>
                        <ul className="space-y-4 font-mono text-xs tracking-wide text-gray-300 pt-4">
                            <li className="flex items-start gap-4">
                                <span className="text-[#f59e0b] text-base leading-none mt-0.5">■</span>
                                <span><strong>Keyboard Focused:</strong> Tab through cells to instantly add "Sangeet Coverage", "Drone Add-on", and "Rush Delivery Fee".</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="text-[#f59e0b] text-base leading-none mt-0.5">■</span>
                                <span><strong>Dynamic Variables:</strong> Type `/gst` in the footer cell to automatically calculate reverse CGST/SGST based on the rows above.</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="text-[#f59e0b] text-base leading-none mt-0.5">■</span>
                                <span><strong>Live Preview:</strong> As you type in the grid, the exact PDF that the client will see updates in real-time on the right.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="lg:w-1/2 w-full">
                        <div className="bg-black border border-white/10 p-4 rounded-sm space-y-1">
                            {/* Mock Grid */}
                            <div className="flex font-mono text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2 mb-2">
                                <div className="w-1/2 pl-2">Description</div>
                                <div className="w-1/4 text-right">Qty / Hour</div>
                                <div className="w-1/4 text-right pr-2">Amount (₹)</div>
                            </div>
                            <div className="flex bg-[#1A1D27] p-2 rounded-sm border border-[#f59e0b]/50">
                                <div className="w-1/2 text-white font-mono text-xs">Traditional Videography (Sangeet)</div>
                                <div className="w-1/4 text-right text-gray-400 font-mono text-xs">4.0</div>
                                <div className="w-1/4 text-right text-white font-mono text-xs">25,000</div>
                            </div>
                            <div className="flex p-2 rounded-sm border border-transparent">
                                <div className="w-1/2 text-white font-mono text-xs">Drone Operator</div>
                                <div className="w-1/4 text-right text-gray-400 font-mono text-xs">1.0</div>
                                <div className="w-1/4 text-right text-white font-mono text-xs">8,000</div>
                            </div>
                            <div className="flex p-2 rounded-sm border border-transparent border-t border-white/10 mt-4 pt-4">
                                <div className="w-3/4 text-right text-gray-500 font-mono text-xs uppercase tracking-widest">Type /gst to calc taxes...</div>
                                <div className="w-1/4 text-right text-white font-mono text-xs animate-pulse">|</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 max-w-4xl mx-auto px-6 text-center border-t border-white/5">
                <h2 className="font-serif text-3xl text-white mb-6">Execution is better than feature lists.</h2>
                <Button size="lg" className="bg-white hover:bg-gray-200 text-black font-mono uppercase tracking-widest rounded-sm border-none h-14 px-12 text-[11px] font-bold">
                    Experience It Live (Free Trial)
                </Button>
            </section>

            <RiskReversal />
        </main>
    )
}
