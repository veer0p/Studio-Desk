import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function GSTInvoicingPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Narrative Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-4xl">
                    Create 100% compliant GST invoices in <span className="text-[#f59e0b]">45 seconds.</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                    Stop struggling with messy Excel templates and avoid tax penalties automatically with Studio-Desk's built-in Indian GST engine.
                </p>
            </section>

            {/* Story & Agitation */}
            <section className="py-16 max-w-3xl mx-auto px-6">
                <div className="space-y-8 text-gray-300 text-lg leading-relaxed font-sans">
                    <p>
                        You're a brilliant photographer, but you're not an accountant. Yet, trying to manually split IGST from CGST/SGST based on state codes on a Saturday night makes you feel like one.
                    </p>
                    <div className="p-6 border border-red-500/30 bg-red-500/5 rounded-sm relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-2">The Old Way</p>
                        <ul className="list-disc pl-5 italic text-gray-400 space-y-2">
                            <li>Copy-pasting an old Word document invoice.</li>
                            <li>Manually calculating 9% CGST and 9% SGST.</li>
                            <li>Realizing you forgot to add the SAC code (998383) again.</li>
                            <li>Client's finance team rejecting the invoice for incorrect formatting.</li>
                        </ul>
                    </div>
                    <p>
                        It's risky. Incorrect invoicing leads to delayed payments from corporate clients and potential penalties during tax season.
                    </p>
                    <h3 className="font-serif text-3xl text-white pt-8">The Studio-Desk Way: Automated Compliance</h3>
                    <p>
                        Studio-Desk is engineered specifically for the Indian tax code. Simply enter your service amount (e.g., ₹1,00,000 for Commercial Video). Our system automatically detects the client's state.
                    </p>
                    <p>
                        If it's an intra-state shoot, it splits it cleanly into 9% CGST & 9% SGST. If inter-state, it applies 18% IGST. It automatically appends your GSTIN, the client's GSTIN, and the correct HSN/SAC codes for photography services. You can generate, preview, and WhatsApp the PDF to the client in under 45 seconds.
                    </p>
                </div>
            </section>

            {/* Feature Demonstration Mock */}
            <section className="py-16 px-6 max-w-5xl mx-auto bg-[#1A1D27]/30 border-y border-white/5 flex flex-col items-center">
                <h3 className="font-mono text-center text-sm uppercase tracking-widest text-[#f59e0b] mb-8">One-Click GST Calculation</h3>
                <div className="w-full max-w-2xl bg-[#0f1117] border border-white/10 p-6 rounded-sm space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                        <span className="font-mono text-xs tracking-widest uppercase text-gray-500">Service: Photography</span>
                        <span className="font-mono text-lg text-white">₹1,50,000</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                        <span className="font-mono text-xs tracking-widest">CGST (9%)</span>
                        <span className="font-mono text-sm">₹13,500</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                        <span className="font-mono text-xs tracking-widest">SGST (9%)</span>
                        <span className="font-mono text-sm">₹13,500</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="font-mono text-xs tracking-widest uppercase text-white font-bold">Total Invoice Value</span>
                        <span className="font-mono text-2xl text-[#f59e0b] font-bold">₹1,77,000</span>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 text-center max-w-2xl mx-auto px-6">
                <h2 className="font-serif text-4xl text-white mb-6">Stop Doing Your Own Math</h2>
                <Button size="lg" className="w-full bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm border-none h-14 text-sm font-bold flex items-center justify-center gap-2">
                    Start Your Free Trial
                </Button>
                <p className="font-mono text-[10px] text-gray-500 uppercase mt-4">GST-ready from day one. No credit card required.</p>
            </section>

            <RiskReversal />
        </main>
    )
}
