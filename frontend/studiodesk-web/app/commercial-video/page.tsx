import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function CommercialVideoPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Category Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] font-mono text-[10px] uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full"></span> For Commercial & Video
                </div>
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-5xl">
                    Look like an <span className="text-[#f59e0b]">agency.</span> Win bigger brands.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                    Send GST-compliant invoices and multi-phase quotes that procurement departments actually approve.
                </p>
                <div className="flex gap-4 pt-4">
                    <Button size="lg" className="bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm border-none h-14 px-8 text-[11px] font-bold">
                        Start Free Trial
                    </Button>
                </div>
            </section>

            {/* Agitation & Problem Section */}
            <section className="py-24 bg-[#1A1D27] border-y border-white/5 mt-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-16 items-center">
                    <div className="lg:w-1/2 space-y-6">
                        <h2 className="font-serif text-4xl text-white">The Corporate Rejection</h2>
                        <div className="space-y-4">
                            <div className="border-l-2 border-red-500/50 pl-4">
                                <p className="text-gray-400 text-lg">"We lost the ₹5L ad shoot because our manual Excel invoice didn't break down CGST/SGST correctly for their finance department."</p>
                            </div>
                        </div>
                        <p className="text-gray-300">
                            B2B clients evaluate your professionalism based on your paperwork. Studio-Desk generates enterprise-grade quotes, captures digital signatures on contracts, and automatically calculates HSN/SAC codes for rigorous 100% Indian GST compliance.
                        </p>
                    </div>

                    {/* Mock Dashboard Sneak Peek */}
                    <div className="lg:w-1/2 w-full p-4 bg-[#0f0f0f] border border-white/10 rounded-sm">
                        <div className="flex justify-between items-center mb-6">
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b]">Tax & Quote Builder</p>
                            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[9px] uppercase text-white">Reliance Comm.</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <div>
                                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Pre-Production</p>
                                    <p className="font-mono text-sm text-white">₹1,50,000</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">SAC 998383</p>
                                    <p className="font-mono text-[10px] text-gray-400">GST @ 18%: ₹27,000</p>
                                </div>
                            </div>

                            <div className="flex justify-between items-center p-3 border border-white/10 bg-[#1A1D27] mt-4">
                                <span className="font-mono text-[10px] uppercase tracking-widest text-gray-300">Total with tax</span>
                                <span className="font-mono text-lg font-bold text-[#f59e0b]">₹1,77,000</span>
                            </div>

                            <Button className="w-full bg-white hover:bg-gray-200 text-black font-mono uppercase tracking-widest rounded-sm h-10 text-[9px] mt-2 font-bold">
                                Send Formal Quote PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            <RiskReversal />
        </main>
    )
}
