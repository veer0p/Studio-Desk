import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function CaseStudiesPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Narrative Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-4xl">
                    Don't take our word for it. <br />
                    <span className="text-[#f59e0b]">Look at their ledger.</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mt-4">
                    How real Indian studios used Studio-Desk to reclaim their time, enforce their pricing, and automate their growth.
                </p>
            </section>

            {/* Case Studies Grid */}
            <section className="py-16 max-w-7xl mx-auto px-6">
                <div className="space-y-16">

                    {/* Case Study 1 */}
                    <div className="flex flex-col lg:flex-row gap-12 bg-[#1A1D27]/50 border border-white/10 rounded-sm overflow-hidden">
                        <div className="lg:w-1/3 bg-black border-r border-white/10 relative p-8 flex flex-col justify-between">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b]">Case Study #01</span>
                            <div className="mt-8">
                                <h3 className="font-serif text-3xl text-white mb-2">Lights & Shadows Studio</h3>
                                <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Mumbai, Maharashtra</p>
                            </div>
                            <div className="mt-16 space-y-4">
                                <div className="border-l-2 border-success pl-4">
                                    <p className="font-mono text-2xl text-white font-bold">14 hrs</p>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500">Saved Weekly on Invoices</p>
                                </div>
                                <div className="border-l-2 border-success pl-4">
                                    <p className="font-mono text-2xl text-white font-bold">0%</p>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500">Payment Default Rate</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-2/3 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                            <h4 className="text-2xl text-white font-bold">"We had ₹4 Lakh trapped in pending payments."</h4>
                            <p className="text-gray-400 leading-relaxed">
                                "Before Studio-Desk, our workflow was completely manual. We would shoot a wedding, send the raw photos via Google Drive, and politely invoice the client over WhatsApp. We had zero leverage. We were acting like a bank, financing our clients' weddings.
                            </p>
                            <p className="text-gray-400 leading-relaxed">
                                We implemented Studio-Desk in October right before the seasonal rush. We started using the 'Locked Gallery' feature. The client receives the gallery link on WhatsApp, but they can only see watermarked thumbnails until the UPI integration confirms the final ₹50,000 balance has hit our account. Within precisely 48 hours of rolling this out, 90% of our pending debt was cleared automatically. Clients don't even argue; the system just presents it as standard procedure."
                            </p>
                            <div className="pt-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border border-white/20 bg-[#0f1117]"></div>
                                <div>
                                    <p className="text-white text-sm font-bold">Rohan Mehta</p>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500">Founder & Lead Photographer</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Case Study 2 */}
                    <div className="flex flex-col lg:flex-row-reverse gap-12 bg-[#1A1D27]/50 border border-white/10 rounded-sm overflow-hidden">
                        <div className="lg:w-1/3 bg-[#0f0f0f] border-l border-white/10 relative p-8 flex flex-col justify-between">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b]">Case Study #02</span>
                            <div className="mt-8">
                                <h3 className="font-serif text-3xl text-white mb-2">Canvas Corporate Media</h3>
                                <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Bengaluru, Karnataka</p>
                            </div>
                            <div className="mt-16 space-y-4">
                                <div className="border-l-2 border-success pl-4">
                                    <p className="font-mono text-2xl text-white font-bold">100%</p>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500">GST Accuracy Rate</p>
                                </div>
                                <div className="border-l-2 border-success pl-4">
                                    <p className="font-mono text-2xl text-white font-bold">+40%</p>
                                    <p className="font-mono text-[9px] uppercase tracking-widest text-gray-500">Increase in Quote Approvals</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-2/3 p-8 lg:p-12 flex flex-col justify-center space-y-6">
                            <h4 className="text-2xl text-white font-bold">"Procurement departments finally take us seriously."</h4>
                            <p className="text-gray-400 leading-relaxed">
                                "We shoot commercials for enterprise tech companies. Procurement teams do not care how good your RED camera is; they care if your SAC codes are correct and if your IGST calculation matches their Ledger. We lost a massive contract in 2024 because our accountant made an error on an intra-state GST invoice and the client dropped us for being 'unprofessional'.
                            </p>
                            <p className="text-gray-400 leading-relaxed">
                                Studio-Desk’s quoting engine solved everything. We punch in the line items and the engine auto-generates a flawless, enterprise-ready PDF quote with all the legal text, SAC codes, and e-signature blocks. They sign the contract on their phone and the multi-phase invoice triggers automatically. We look like a 50-person agency, even though there are only three of us."
                            </p>
                        </div>
                    </div>

                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 text-center max-w-2xl mx-auto px-6">
                <h2 className="font-serif text-4xl text-white mb-6">Write your own success story.</h2>
                <Button size="lg" className="w-full bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm border-none h-14 text-sm font-bold flex items-center justify-center gap-2">
                    Start Your 30-Day Free Trial
                </Button>
                <p className="font-mono text-[10px] text-gray-500 uppercase mt-4">Takes 2 minutes to set up.</p>
            </section>

            <RiskReversal />
        </main>
    )
}
