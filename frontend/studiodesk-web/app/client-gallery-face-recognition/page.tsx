import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { RiskReversal } from "@/components/marketing/RiskReversal";

export default function GalleryDeliveryPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Narrative Hero */}
            <section className="pt-24 pb-16 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
                <h1 className="font-serif text-5xl lg:text-7xl leading-[1.1] font-semibold max-w-4xl">
                    Deliver 5,000 photos and let <span className="text-[#f59e0b]">Face Recognition</span> find the bride.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl">
                    Stop answering "where are my photos?!" texts. Give your clients a hyper-personalized gallery experience that doesn't expire in 30 days like a Google Drive link.
                </p>
            </section>

            {/* Story & Agitation */}
            <section className="py-16 max-w-3xl mx-auto px-6">
                <div className="space-y-8 text-gray-300 text-lg leading-relaxed font-sans">
                    <p>
                        A massive Indian wedding results in thousands of edited photos. When you share a generic Google Drive folder, your client is forced to scroll endlessly to find pictures of themselves and their immediate family.
                    </p>
                    <div className="p-6 border border-red-500/30 bg-red-500/5 rounded-sm relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                        <p className="font-mono text-xs uppercase tracking-widest text-red-500 mb-2">The Old Way</p>
                        <ul className="list-disc pl-5 italic text-gray-400 space-y-2">
                            <li>"Hi, the drive link expired, can you resend?"</li>
                            <li>"My aunt can't find her solo portraits in folder 04_Reception."</li>
                            <li>"Can you make a separate folder just with photos of my parents?"</li>
                        </ul>
                    </div>
                    <p>
                        It creates massive post-event friction and ruins the final delivery experience—the very moment your client should be the happiest.
                    </p>
                    <h3 className="font-serif text-3xl text-white pt-8">The Studio-Desk Way: AI-Powered Delight</h3>
                    <p>
                        Studio-Desk's gallery doesn't just store files; it intelligently organizes them. Guests can upload a single selfie, and our AWS Rekognition engine instantly filters the 5,000-image gallery to show *only* the photos they are in.
                    </p>
                    <p>
                        <strong className="text-white">Seamless selections:</strong> The client can heart their favorites for the album directly in the app. No more Excel sheets row-matching filenames like `IMG_9482.jpg`. The selection is sent directly back to your dashboard.
                    </p>
                </div>
            </section>

            {/* Feature Demonstration Mock */}
            <section className="py-16 px-6 max-w-5xl mx-auto bg-[#1A1D27]/30 border-y border-white/5 flex flex-col items-center">
                <h3 className="font-mono text-center text-sm uppercase tracking-widest text-[#f59e0b] mb-8">Client Selection Sync</h3>
                <div className="w-full max-w-3xl bg-[#0f1117] border border-white/10 p-6 rounded-sm">
                    <div className="flex justify-between items-center mb-6">
                        <span className="font-mono text-xs tracking-widest uppercase text-gray-500">Album Selection: Rahul & Priya</span>
                        <span className="bg-success/10 text-success border border-success/30 px-3 py-1 rounded-sm font-mono text-[10px] uppercase">Client Finalized</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-[#1A1D27] border border-white/5 flex items-center justify-center relative">
                                <span className="text-gray-700 text-3xl">📷</span>
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#f59e0b] border-2 border-[#0f1117] flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-[#0f1117] rounded-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">350 / 350 Photos Selected</p>
                        <Button className="bg-white hover:bg-gray-200 text-black font-mono uppercase tracking-widest rounded-sm h-8 px-4 text-[9px] font-bold">
                            Export Filenames to Lightroom
                        </Button>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 text-center max-w-2xl mx-auto px-6">
                <h2 className="font-serif text-4xl text-white mb-6">Upgrade Your Delivery Experience</h2>
                <Button size="lg" className="w-full bg-[#whatsapp] hover:bg-[#1da851] text-white font-mono uppercase tracking-widest rounded-sm border-none h-14 text-sm font-bold flex items-center justify-center gap-2">
                    Ask About Gallery Features on WhatsApp
                </Button>
            </section>

            <RiskReversal />
        </main>
    )
}
