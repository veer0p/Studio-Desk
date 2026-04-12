export function OutcomeProof() {
    return (
        <section className="border-y border-white/5 py-16 bg-[#1A1D27]/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <h2 className="font-serif text-2xl lg:text-3xl text-center text-[#F9FAFB] mb-12">
                    Trusted by India's top studios. Built for <span className="italic text-gray-400">real</span> operations.
                </h2>

                {/* Anti-AI Design: Clean geometrics, monochromatic data display */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Card 1 */}
                    <div className="p-8 border border-white/10 bg-[#0f1117] rounded-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <div className="w-16 h-16 rounded-full border-4 border-white"></div>
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b] mb-4 flex items-center gap-2">
                            <span className="w-1 h-1 bg-[#f59e0b] rounded-full"></span>
                            Mumbai Wedding Studio
                        </p>
                        <div className="flex flex-col gap-1">
                            <p className="text-gray-500 line-through decoration-red-500/50">34 days average payment collection</p>
                            <p className="font-serif text-3xl text-white">2 days collection time.</p>
                        </div>
                        <p className="mt-6 text-sm text-gray-400 leading-relaxed">
                            "We used to waste half our week begging for pending payments. Now, the gallery literally doesn't unlock until the UPI transaction clears."
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="p-8 border border-white/10 bg-[#0f1117] rounded-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <div className="w-16 h-16 border-4 border-white transform rotate-45"></div>
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-[#f59e0b] mb-4 flex items-center gap-2">
                            <span className="w-1 h-1 bg-[#f59e0b] rounded-full"></span>
                            Pune Portrait Studio
                        </p>
                        <div className="flex flex-col gap-1">
                            <p className="text-gray-500 line-through decoration-red-500/50">12 hours/week admin tracking</p>
                            <p className="font-serif text-3xl text-white">3 hours weekly admin.</p>
                        </div>
                        <p className="mt-6 text-sm text-gray-400 leading-relaxed">
                            "Finally, a CRM that understands Indian GST. I generate compliant invoices in 45 seconds while the client is still sitting in my office."
                        </p>
                    </div>
                </div>

                {/* Brand Bar / Logos - Raw typography instead of colorful logos to maintain artisan aesthetic */}
                <div className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center items-center gap-12 sm:gap-24 opacity-40 grayscale">
                    <div className="font-serif text-2xl font-bold tracking-tighter">WedMeGood</div>
                    <div className="font-serif text-2xl font-bold tracking-tighter">Canvera</div>
                    <div className="font-serif text-xl font-bold tracking-tight">Better Photography</div>
                    <div className="font-serif text-xl font-bold tracking-tight">Asian Photography</div>
                </div>
            </div>
        </section>
    );
}
