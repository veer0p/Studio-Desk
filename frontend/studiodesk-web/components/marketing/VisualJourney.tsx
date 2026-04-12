export function VisualJourney() {
    const steps = [
        { title: "Lead Generation", desc: "Automated WhatsApp capture replaces clunky email forms.", highlight: "0% Dropoff" },
        { title: "Auto-Invoice & GST", desc: "Instantly create GST-compliant quotes split into CGST/SGST.", highlight: "100% Compliant" },
        { title: "UPI Collection", desc: "Clients scan your QR code or click deep links to pay instantly.", highlight: "Instant Settlement" },
        { title: "Face-Rec Delivery", desc: "AI-powered gallery delivery customized to recognized faces.", highlight: "Zero Complaints" },
    ];

    return (
        <section className="py-24 max-w-7xl mx-auto px-6 lg:px-12 overflow-hidden">
            <div className="flex flex-col items-center mb-16">
                <h2 className="font-serif text-4xl text-center text-white">The Lead-to-Payment Pipeline</h2>
                <p className="text-gray-400 mt-4 max-w-2xl text-center">Stop jumping between Excel, WhatsApp, and Google Drive. One single flow for your entire operation.</p>
            </div>

            <div className="relative">
                {/* Horizontal Line connecting nodes for desktop */}
                <div className="hidden lg:block absolute top-[28px] left-0 w-full h-px bg-white/10 z-0"></div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col">
                            <div className="flex items-center lg:block bg-[#0f0f0f] lg:bg-transparent pr-4 lg:pr-0">
                                <div className="w-14 h-14 rounded-sm bg-[#1A1D27] border border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-center flex-shrink-0 z-10 relative">
                                    <span className="font-mono text-[#f59e0b] text-lg font-bold">0{idx + 1}</span>
                                </div>
                                {/* Vertical line connecting nodes for mobile */}
                                <div className="lg:hidden h-16 border-l border-white/10 ml-[27px] absolute -z-10 group-last:hidden"></div>

                                <div className="ml-6 lg:ml-0 lg:mt-6">
                                    <h3 className="font-mono text-sm tracking-widest uppercase text-white mb-2">{step.title}</h3>
                                    <div className="inline-block px-2 py-1 bg-white/5 border border-white/10 rounded-sm font-mono text-[9px] uppercase tracking-widest text-[#f59e0b] mb-3">
                                        {step.highlight}
                                    </div>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
