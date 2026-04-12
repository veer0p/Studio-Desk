export function CategoryCards() {
    const categories = [
        {
            title: "Wedding Photographers",
            problem: "Handle 50+ weddings/year without chaos.",
            feature: "Event Timeline Tracking",
        },
        {
            title: "Portrait Studios",
            problem: "Never lose a sitting fee to no-shows again.",
            feature: "Auto-Advance Collection",
        },
        {
            title: "Commercial & Video",
            problem: "Invoice brands with professional GST compliance.",
            feature: "Tax & Quote Builder",
        }
    ];

    return (
        <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
                {categories.map((cat, idx) => (
                    <div key={idx} className="group relative border border-white/10 bg-[#1A1D27] rounded-sm p-8 hover:border-[#f59e0b]/50 transition-colors cursor-pointer overflow-hidden flex flex-col h-[280px]">
                        <h3 className="font-serif text-2xl text-white mb-4 z-10 relative">{cat.title}</h3>
                        <p className="text-gray-400 font-sans z-10 relative">{cat.problem}</p>

                        <div className="mt-auto z-10 relative">
                            <p className="font-mono text-[10px] uppercase text-[#f59e0b] tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                                See {cat.feature} <span className="font-serif text-lg leading-none">→</span>
                            </p>
                        </div>

                        {/* Subtle Hover overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#f59e0b]/10 to-transparent group-hover:h-32 transition-all duration-500 ease-out z-0"></div>
                    </div>
                ))}
            </div>
        </section>
    );
}
