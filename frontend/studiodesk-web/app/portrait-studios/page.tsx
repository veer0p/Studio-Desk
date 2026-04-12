import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { InteractiveDemo } from "@/components/marketing/InteractiveDemo";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function PortraitStudiosPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Category Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] font-mono text-[10px] uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full"></span> For Portrait Studios
                </div>
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-5xl">
                    Stop holding your breath for the <span className="text-[#f59e0b]">sitting fee.</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                    Accept UPI instantly while the client is still in the studio. Never lose money to a no-show again.
                </p>
                <div className="flex gap-4 pt-4">
                    <Button size="lg" className="bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm border-none h-14 px-8 text-[11px] font-bold">
                        Start Free Trial
                    </Button>
                </div>
            </section>

            {/* Embedded Demo */}
            <section className="py-16 px-6 max-w-5xl mx-auto">
                {/* Reusing Interactive Demo but in real implementation this would show a smaller "Sitting Fee" amount */}
                <InteractiveDemo />
            </section>

            {/* Agitation & Problem Section */}
            <section className="py-24 bg-[#1A1D27] border-y border-white/5 mt-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-16 items-center">
                    <div className="lg:w-1/2 space-y-6">
                        <h2 className="font-serif text-4xl text-white">The No-Show Epidemic</h2>
                        <div className="space-y-4">
                            <div className="border-l-2 border-red-500/50 pl-4">
                                <p className="text-gray-400 text-lg">"They booked a 2 PM slot, my makeup artist arrived, and the client never showed up. No advance was taken."</p>
                            </div>
                        </div>
                        <p className="text-gray-300">
                            Your time is the product. Studio-Desk allows you to send an automated WhatsApp booking link that requires a ₹2,000 UPI hold before the slot is confirmed. When the client walks in, simply convert that hold into a final GST invoice.
                        </p>
                    </div>

                    {/* Mock Dashboard Sneak Peek */}
                    <div className="lg:w-1/2 w-full p-4 bg-[#0f0f0f] border border-white/10 rounded-sm">
                        <div className="flex justify-between items-center mb-6">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b]">Studio Calendar</p>
                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[9px] uppercase text-white">Today: 14:00</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 border-l-2 border-success bg-[#1A1D27]">
                                <span className="font-mono text-xs text-gray-300">14:00 - Family Portrait (Booked)</span>
                                <span className="font-mono text-[9px] uppercase tracking-widest text-success border border-success/30 bg-success/10 px-2 py-1 rounded-sm">₹2k Paid</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border-l-2 border-red-500 bg-[#1A1D27]/50 opacity-50">
                                <span className="font-mono text-xs text-white">16:00 - Headshots (Pending)</span>
                                <span className="font-mono text-[9px] uppercase tracking-widest text-red-500">Unpaid</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <RiskReversal />
        </main>
    )
}
