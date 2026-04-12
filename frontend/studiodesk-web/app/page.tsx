import { HeroSection } from "@/components/marketing/HeroSection";
import { MarketingNav } from "@/components/marketing/MarketingNav";

export default function MarketingHomePage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            <HeroSection />

            {/* Sticky Bottom Bar (Mobile) */}
            <div className="fixed bottom-0 left-0 w-full p-4 bg-[#1A1D27]/90 backdrop-blur-md border-t border-white/10 md:hidden flex gap-2 z-50">
                <button className="flex-1 bg-whatsapp text-white p-3 rounded-sm font-mono text-[11px] tracking-widest font-bold uppercase flex items-center justify-center">
                    📱 WhatsApp Us
                </button>
                <button className="flex-1 bg-[#F9FAFB] text-[#0f0f0f] p-3 rounded-sm font-mono text-[11px] tracking-widest font-bold uppercase flex items-center justify-center">
                    💬 Start Trial
                </button>
            </div>
        </main>
    );
}
