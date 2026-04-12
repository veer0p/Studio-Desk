import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { InteractiveDemo } from "@/components/marketing/InteractiveDemo";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function WeddingPhotographersPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Category Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] font-mono text-[10px] uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full"></span> For Wedding Studios
                </div>
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-5xl">
                    Delhi wedding photographers lose <span className="text-[#f59e0b]">₹2L/year</span> to payment delays.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                    Fix it before the next Sangeet. Collect 50% advances instantly and generate GST invoices while you're still on the shoot.
                </p>
                <div className="flex gap-4 pt-4">
                    <Button size="lg" className="bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm border-none h-14 px-8 text-[11px] font-bold">
                        Start Free Trial
                    </Button>
                </div>
            </section>

            {/* Embedded Demo */}
            <section className="py-16 px-6 max-w-5xl mx-auto">
                <InteractiveDemo />
            </section>

            {/* Agitation & Problem Section */}
            <section className="py-24 bg-[#1A1D27] border-y border-white/5 mt-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-16 items-center">
                    <div className="lg:w-1/2 space-y-6">
                        <h2 className="font-serif text-4xl text-white">The 3 AM Panic</h2>
                        <div className="space-y-4">
                            <div className="border-l-2 border-red-500/50 pl-4">
                                <p className="text-gray-400 text-lg">"The vendor needs ₹1L for the Sangeet tomorrow, but the bride's father hasn't cleared the advance."</p>
                            </div>
                            <div className="border-l-2 border-red-500/50 pl-4">
                                <p className="text-gray-400 text-lg">"We delivered the drive link, and now the client won't reply to our WhatsApp messages for the final 20%."</p>
                            </div>
                        </div>
                        <p className="text-gray-300">
                            Your artistic capability doesn't matter if your cash flow puts you out of business. Studio-Desk enforces rigorous, automated accountability for your clients without making you look like the bad guy.
                        </p>
                    </div>

                    {/* Mock Dashboard Sneak Peek */}
                    <div className="lg:w-1/2 w-full p-4 bg-[#0f0f0f] border border-white/10 rounded-sm">
                        <div className="flex justify-between items-center mb-6">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b]">Event Timeline Tracking</p>
                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[9px] uppercase text-white">Rahul & Priya Wedding</span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 border-l-2 border-success bg-[#1A1D27]">
                                <span className="font-mono text-xs text-gray-300">Mehndi - Advance Cleared</span>
                                <span className="font-serif text-success">✓</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border-l-2 border-[#f59e0b] bg-[#1A1D27]">
                                <span className="font-mono text-xs text-white">Sangeet - Pending 50%</span>
                                <span className="font-mono text-[9px] uppercase tracking-widest text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-1 rounded-sm">Warn Client</span>
                            </div>
                            <div className="flex justify-between items-center p-3 border-l-2 border-gray-700 bg-[#1A1D27] opacity-50">
                                <span className="font-mono text-xs text-gray-500">Reception - Locked</span>
                                <span className="text-xs text-gray-500">🔒</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <RiskReversal />
        </main>
    )
}
