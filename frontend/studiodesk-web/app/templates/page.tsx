import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";

export default function TemplatesPage() {
    const templates = [
        { title: "Wedding Photography GST Invoice", format: "Excel & PDF", downloads: "12,400+" },
        { title: "Freelance Portrait Sitting Agreement", format: "Word Doc", downloads: "8,200+" },
        { title: "Commercial Ad Shoot Multi-Phase Quote", format: "Excel", downloads: "5,100+" },
        { title: "Maternity Shoot Model Release Form", format: "Word & PDF", downloads: "9,000+" },
        { title: "Event Photography Pricing Packages", format: "Canva & PDF", downloads: "15,200+" }
    ];

    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Narrative Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-4xl">
                    Free templates for the <span className="text-[#f59e0b]">business</span> of photography.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mt-4">
                    Download Indian-specific, GST-compliant templates for invoicing, quoting, and legal contracts. 100% free. No email required.
                </p>
            </section>

            {/* SEO Template Grid */}
            <section className="py-16 max-w-5xl mx-auto px-6 mb-24">
                <div className="grid md:grid-cols-2 gap-6">
                    {templates.map((tpl, i) => (
                        <div key={i} className="flex flex-col justify-between border border-white/10 bg-[#1A1D27] p-6 rounded-sm hover:border-[#f59e0b]/50 transition-colors">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="bg-white/5 text-gray-400 border border-white/10 px-2 py-1 rounded-sm font-mono text-[9px] uppercase tracking-widest">{tpl.format}</span>
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#success]">{tpl.downloads} DLs</span>
                                </div>
                                <h3 className="font-serif text-xl text-white mb-2">{tpl.title}</h3>
                                <p className="text-gray-400 text-sm mb-6">Perfect for Indian studios needing HSN/SAC code formatting and standard terms & conditions.</p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex gap-4">
                                <Button variant="outline" className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/5 font-mono uppercase tracking-widest rounded-sm h-10 text-[9px]">
                                    Download {tpl.format.split(' ')[0]}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* The "Aha!" Moment Upsell */}
            <section className="py-24 max-w-7xl mx-auto px-6 border-t border-white/5 bg-[#1A1D27]/30">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="lg:w-1/2 space-y-6">
                        <h2 className="font-serif text-4xl text-white">Why fill templates manually?</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            You can keep downloading Excel files, changing the client's name 5 times, and manually calculating 9% CGST. It takes about 20 minutes per client.
                        </p>
                        <p className="text-gray-300 font-bold">
                            Or, you can use Studio-Desk to generate the exact same templates with 1 click, sent directly to WhatsApp with a UPI payment link attached.
                        </p>
                        <div className="pt-4 flex gap-4">
                            <Button className="bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm border-none h-12 px-8 text-[10px] font-bold">
                                Automate My Workflow (30 Days Free)
                            </Button>
                        </div>
                    </div>
                    <div className="lg:w-1/2 w-full p-6 bg-[#0f1117] border border-white/10 rounded-sm">
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-white/5 rounded-sm w-1/3"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-white/5 rounded-sm w-full"></div>
                                <div className="h-4 bg-[#f59e0b]/20 rounded-sm w-full"></div>
                                <div className="h-4 bg-white/5 rounded-sm w-3/4"></div>
                            </div>
                            <div className="h-12 bg-[#success]/20 rounded-sm w-full border border-success/30 flex items-center justify-center font-mono text-[10px] uppercase text-success tracking-widest">
                                Invoice Sent & Paid Automatically
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    )
}
