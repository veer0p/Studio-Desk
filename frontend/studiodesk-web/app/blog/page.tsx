import { MarketingNav } from "@/components/marketing/MarketingNav";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function BlogPage() {
    const articles = [
        { title: "How to negotiate copyright buyouts with Indian Ad Agencies", tag: "Business Guide", readTime: "8 min read" },
        { title: "Demystifying SAC 998383: A Photographer's Guide to GST", tag: "Tax Compliance", readTime: "5 min read" },
        { title: "The exact email script to send when a client demands raw files", tag: "Templates", readTime: "3 min read" },
        { title: "Why delivering weddings via Google Drive is destroying your brand", tag: "Client Experience", readTime: "6 min read" },
    ];

    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Narrative Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-4xl">
                    The <span className="text-[#f59e0b]">Business</span> of Photography.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mt-4">
                    Tactical guides, templates, and operational theory for growing high-end photography studios in India. No gear reviews.
                </p>
            </section>

            {/* Articles Grid */}
            <section className="py-16 max-w-7xl mx-auto px-6 mb-24">
                <div className="grid md:grid-cols-2 gap-8">
                    {articles.map((article, i) => (
                        <div key={i} className="group border border-white/10 bg-[#1A1D27] p-8 rounded-sm hover:border-[#f59e0b]/50 transition-all cursor-pointer flex flex-col justify-between h-64">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#f59e0b]">{article.tag}</span>
                                    <span className="font-mono text-[9px] uppercase tracking-widest text-gray-500">{article.readTime}</span>
                                </div>
                                <h3 className="font-serif text-2xl text-white leading-tight group-hover:text-[#f59e0b] transition-colors">{article.title}</h3>
                            </div>
                            <div className="mt-auto">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-white flex items-center gap-2 group-hover:gap-4 transition-all opacity-0 group-hover:opacity-100">
                                    Read Article <span className="font-serif text-lg leading-none">→</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <RiskReversal />
        </main>
    )
}
