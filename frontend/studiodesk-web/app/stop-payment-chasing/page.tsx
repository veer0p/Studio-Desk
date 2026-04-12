import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { InteractiveDemo } from "@/components/marketing/InteractiveDemo";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function StopPaymentChasingPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Narrative Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-4xl">
                    How to collect wedding album payments <span className="text-[#f59e0b]">without</span> awkward follow-up calls.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                    Rahul hasn't cleared his balance, but he wants the raw files. You hate confrontation. Here is exactly how Studio-Desk fixes this permanently.
                </p>
            </section>

            {/* Story & Agitation */}
            <section className="py-16 max-w-3xl mx-auto px-6">
                <div className="space-y-8 text-gray-300 text-lg leading-relaxed font-sans">
                    <p>
                        We've all been there: The wedding is over. The photos are edited. You send the Google Drive link, and suddenly... crickets.
                    </p>
                    <div className="p-6 border border-red-500/30 bg-red-500/5 rounded-sm relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-2">The Old Way</p>
                        <p className="italic text-gray-400">"Hi Rahul, hope you liked the photos! Just a gentle reminder about the pending ₹45,000..."</p>
                        <p className="italic text-gray-400 mt-2">"Hi Rahul, checking in again..."</p>
                    </div>
                    <p>
                        It's emotionally draining to beg for money you already earned. Moreover, every hour you spend chasing invoices is an hour you aren't shooting or marketing. Studio-Desk replaces 5 disjointed tools (Excel, Drive, WhatsApp, Stripe, PDF invoices) with 1 unified flow.
                    </p>
                    <h3 className="font-serif text-3xl text-white pt-8">The Studio-Desk Way: Automated Leverage</h3>
                    <p>
                        With Studio-Desk, the concept of "chasing" is eliminated by the architecture of the delivery process. You upload photos to our gallery. The client receives a beautiful email and WhatsApp link.
                    </p>
                    <p>
                        <strong className="text-white">But the magic happens when they click it:</strong> The gallery is locked behind a clean, professional paywall displaying exactly what is owed. They scan the UPI QR code, pay instantly, and the system automatically unlocks their photos and generates the final GST invoice. You don't lift a finger.
                    </p>
                </div>
            </section>

            {/* Interactive ROI Demo */}
            <section className="py-16 px-6 max-w-5xl mx-auto bg-[#1A1D27]/30 border-y border-white/5">
                <h3 className="font-mono text-center text-sm uppercase tracking-widest text-[#f59e0b] mb-12">Try The Payment Capture Flow Live</h3>
                <InteractiveDemo />
            </section>

            {/* Final CTA */}
            <section className="py-24 text-center max-w-2xl mx-auto px-6">
                <h2 className="font-serif text-4xl text-white mb-6">Fix My Payment Flow</h2>
                <Button size="lg" className="w-full bg-[#whatsapp] hover:bg-[#1da851] text-white font-mono uppercase tracking-widest rounded-sm border-none h-14 text-sm font-bold flex items-center justify-center gap-2">
                    Ask Us A Question On WhatsApp
                </Button>
                <p className="font-mono text-[10px] text-gray-500 uppercase mt-4">We reply in 3 minutes.</p>
            </section>

            <RiskReversal />
        </main>
    )
}
