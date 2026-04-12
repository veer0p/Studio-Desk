import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Narrative Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-4xl">
                    Radically simple pricing. <br />
                    <span className="text-[#f59e0b]">No GST checkout surprises.</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mt-4">
                    All plans include unlimited invoicing and full WhatsApp API access. Pay based on your gallery storage needs and team size.
                </p>

                {/* Pricing Toggle Mock */}
                <div className="mt-8 flex items-center justify-center gap-4 bg-[#1A1D27] border border-white/10 rounded-sm p-1">
                    <div className="px-6 py-2 bg-[#0f1117] text-white font-mono text-[10px] uppercase tracking-widest rounded-sm border border-white/5 cursor-pointer">Billed Monthly</div>
                    <div className="px-6 py-2 text-gray-500 hover:text-white font-mono text-[10px] uppercase tracking-widest rounded-sm cursor-pointer transition-colors flex items-center gap-2">
                        Billed Yearly <span className="bg-success/10 text-success border border-success/30 px-1 py-0.5 rounded-sm">Save 20%</span>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-12 max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-6 items-end">

                    {/* Tier 1: Freelancer */}
                    <div className="border border-white/10 bg-[#1A1D27]/50 rounded-sm p-8 flex flex-col h-full">
                        <h3 className="font-sans text-xl font-bold text-white mb-2">Freelance</h3>
                        <p className="text-gray-400 text-sm mb-6">For solo photographers capturing weddings & portraits.</p>
                        <div className="mb-6">
                            <span className="font-mono text-4xl text-white font-bold">₹1,499</span><span className="text-gray-500 font-mono text-sm">/mo</span>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b] mt-2">Inclusive of 18% GST</p>
                        </div>
                        <Button className="w-full bg-white hover:bg-gray-200 text-black font-mono uppercase tracking-widest rounded-sm h-12 text-[10px] font-bold mb-8 transition-colors">
                            Start 30-Day Trial
                        </Button>
                        <div className="space-y-4 font-mono text-[11px] text-gray-300">
                            <div className="flex items-center gap-3"><span className="text-success">✓</span> 1 User Account</div>
                            <div className="flex items-center gap-3"><span className="text-success">✓</span> 500GB Gallery Storage</div>
                            <div className="flex items-center gap-3"><span className="text-success">✓</span> Unlimited Invoices & Quotes</div>
                            <div className="flex items-center gap-3"><span className="text-success">✓</span> WhatsApp Payment Links</div>
                            <div className="flex items-center gap-3 opacity-50"><span className="text-gray-600">✕</span> Team Kanban Board</div>
                        </div>
                    </div>

                    {/* Tier 2: Studio (Highlighted) */}
                    <div className="border-2 border-[#f59e0b] bg-[#1A1D27] rounded-sm p-8 relative flex flex-col h-full transform md:-translate-y-4 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#f59e0b] text-black font-mono text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
                            Most Popular For India
                        </div>
                        <h3 className="font-sans text-2xl font-bold text-white mb-2">Studio</h3>
                        <p className="text-gray-400 text-sm mb-6">For growing teams requiring robust workflow management.</p>
                        <div className="mb-6">
                            <span className="font-mono text-5xl text-white font-bold">₹2,999</span><span className="text-gray-500 font-mono text-sm">/mo</span>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b] mt-2">Inclusive of 18% GST</p>
                        </div>
                        <Button className="w-full bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm h-14 text-[11px] font-bold mb-8 transition-colors">
                            Start 30-Day Trial
                        </Button>
                        <div className="space-y-4 font-mono text-[11px] text-gray-300">
                            <div className="flex items-center gap-3"><span className="text-[#f59e0b]">✓</span> Up to 5 User Accounts</div>
                            <div className="flex items-center gap-3"><span className="text-[#f59e0b]">✓</span> 2TB Gallery Storage</div>
                            <div className="flex items-center gap-3"><span className="text-[#f59e0b]">✓</span> Advanced AI Face Recognition</div>
                            <div className="flex items-center gap-3"><span className="text-[#f59e0b]">✓</span> Multi-phase Contract E-Signs</div>
                            <div className="flex items-center gap-3"><span className="text-[#f59e0b]">✓</span> Team Kanban Board</div>
                        </div>
                    </div>

                    {/* Tier 3: Agency */}
                    <div className="border border-white/10 bg-[#1A1D27]/50 rounded-sm p-8 flex flex-col h-full">
                        <h3 className="font-sans text-xl font-bold text-white mb-2">Agency</h3>
                        <p className="text-gray-400 text-sm mb-6">Uncapped operations for large commercial video teams.</p>
                        <div className="mb-6">
                            <span className="font-mono text-4xl text-white font-bold">₹5,999</span><span className="text-gray-500 font-mono text-sm">/mo</span>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b] mt-2">Inclusive of 18% GST</p>
                        </div>
                        <Button className="w-full bg-white hover:bg-gray-200 text-black font-mono uppercase tracking-widest rounded-sm h-12 text-[10px] font-bold mb-8 transition-colors">
                            Start 30-Day Trial
                        </Button>
                        <div className="space-y-4 font-mono text-[11px] text-gray-300">
                            <div className="flex items-center gap-3"><span className="text-gray-400">✓</span> Unlimited User Accounts</div>
                            <div className="flex items-center gap-3"><span className="text-gray-400">✓</span> 10TB Gallery Storage</div>
                            <div className="flex items-center gap-3"><span className="text-gray-400">✓</span> Custom Domain (White-label)</div>
                            <div className="flex items-center gap-3"><span className="text-gray-400">✓</span> Priority API Support</div>
                            <div className="flex items-center gap-3"><span className="text-gray-400">✓</span> Custom Contract Templates</div>
                        </div>
                    </div>

                </div>
            </section>

            {/* FAQs */}
            <section className="py-24 max-w-4xl mx-auto px-6">
                <h2 className="font-serif text-3xl text-center text-white mb-12">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <div className="border border-white/10 bg-[#0f1117] p-6 rounded-sm">
                        <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-2">Is the 18% GST really included?</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Yes. If a plan says ₹2,999/mo, that is precisely the amount that will be deducted from your card. You will receive a B2B tax invoice where the GST component is reverse-calculated, allowing you to claim Input Tax Credit (ITC).</p>
                    </div>
                    <div className="border border-white/10 bg-[#0f1117] p-6 rounded-sm">
                        <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-2">Do you charge transaction fees on UPI payments?</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">No. We connect directly to your preferred payment gateway (Razorpay/Cashfree) or let you upload your static UPI QR code. We do not take ANY percentage cut of your bookings.</p>
                    </div>
                    <div className="border border-white/10 bg-[#0f1117] p-6 rounded-sm">
                        <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#f59e0b] mb-2">Can I upgrade from Freelance to Studio later?</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">Absolutely. All plan upgrades are prorated automatically. When you hire an editor and need more seats, you can upgrade with a single click.</p>
                    </div>
                </div>
            </section>

            <RiskReversal />
        </main>
    )
}
