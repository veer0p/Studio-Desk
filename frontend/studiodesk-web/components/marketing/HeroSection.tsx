import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8">
                {/* Anti-AI Artisan typography: Playfair Display */}
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold text-[#F9FAFB]">
                    Stop losing <span className="text-[#f59e0b]">₹50,000/month</span> to payment delays.
                </h1>
                <div className="space-y-4">
                    <p className="text-xl text-gray-300">
                        Chasing clients for payments after delivery? That's <span className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded-sm border border-white/20">23 hours/week</span> of awkward follow-ups and lost leverage.
                    </p>
                    <p className="text-lg text-gray-400">
                        Studio-Desk collects your 50% advance automatically via UPI and creates professional GST invoices before the event starts.
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button size="lg" className="bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm border-none h-14 px-8 text-[11px] font-bold">
                        See Your Payment Timeline
                    </Button>
                    <Button size="lg" variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5 font-mono uppercase tracking-widest rounded-sm h-14 px-8 text-[11px]">
                        Watch 2-Min Demo
                    </Button>
                </div>

                {/* WhatsApp trust marker */}
                <div className="pt-2">
                    <button className="text-gray-400 hover:text-white font-mono text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors">
                        <span className="w-2 h-2 rounded-full bg-whatsapp inline-block animate-pulse"></span>
                        Questions? Ask on WhatsApp
                    </button>
                </div>
            </div>

            {/* UI Mockup - Precision Geometry & Flat Shadows */}
            <div className="lg:w-1/2 w-full mt-12 lg:mt-0">
                <div className="relative rounded-md border border-white/10 bg-[#1A1D27] shadow-xl p-4 overflow-hidden aspect-[4/3] flex flex-col">
                    {/* Top Bar simulating Artisan Node structure */}
                    <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-4">
                        <div className="w-2.5 h-2.5 rounded-sm bg-white/20"></div>
                        <div className="w-2.5 h-2.5 rounded-sm bg-white/20"></div>
                        <div className="w-2.5 h-2.5 rounded-sm bg-white/20"></div>
                        <div className="ml-4 font-mono text-[9px] uppercase tracking-widest text-gray-500">Invoice / INV-2401</div>
                    </div>

                    {/* Mock Dashboard Body */}
                    <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500 mb-1">Balance Due</p>
                                <p className="font-mono text-4xl font-bold text-[#f59e0b] tracking-tight">₹45,000</p>
                            </div>
                            <div className="px-2 py-1.5 border border-success/30 rounded-sm bg-success/10 text-success font-mono text-[9px] uppercase tracking-widest">
                                Advance Paid: ₹45,000
                            </div>
                        </div>

                        <div className="h-px bg-white/5 w-full my-4"></div>

                        <div className="space-y-2">
                            <div className="h-10 border border-white/10 bg-[#0f1117]/50 rounded-sm flex items-center px-4 justify-between">
                                <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">Pre-Wedding Shoot</span>
                                <span className="font-mono text-[11px] text-white tracking-widest">₹25,000</span>
                            </div>
                            <div className="h-10 border border-white/10 bg-[#0f1117]/50 rounded-sm flex items-center px-4 justify-between">
                                <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">Wedding Day Cover</span>
                                <span className="font-mono text-[11px] text-white tracking-widest">₹65,000</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 flex flex-col gap-2">
                            <div className="h-12 w-full bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-sm flex items-center justify-center cursor-pointer hover:bg-[#f59e0b]/20 transition-colors">
                                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#f59e0b]">Send Payment Link (WhatsApp)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
