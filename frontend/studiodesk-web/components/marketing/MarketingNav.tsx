import Link from "next/link";
import { ROUTES } from "@/lib/constants/routes";

export function MarketingNav() {
    return (
        <nav className="w-full border-b border-white/10 bg-[#0f0f0f]/80 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3">
                    {/* Geometric node logo */}
                    <div className="w-6 h-6 border border-[#f59e0b] rounded-sm flex items-center justify-center bg-[#f59e0b]/10">
                        <div className="w-2 h-2 bg-[#f59e0b] rounded-[1px]"></div>
                    </div>
                    <span className="font-serif font-bold text-xl tracking-wide text-white">Studio-Desk</span>
                </Link>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href={ROUTES.FEATURES} className="text-gray-400 font-mono text-[10px] uppercase tracking-widest hover:text-white transition-colors">
                        Features
                    </Link>
                    <Link href={ROUTES.PRICING} className="text-gray-400 font-mono text-[10px] uppercase tracking-widest hover:text-white transition-colors">
                        Pricing
                    </Link>
                    <Link href={ROUTES.CASE_STUDIES} className="text-gray-400 font-mono text-[10px] uppercase tracking-widest hover:text-white transition-colors">
                        Case Studies
                    </Link>

                    <div className="h-4 w-px bg-white/20 ml-2 mr-2"></div>

                    <Link href={ROUTES.SIGNUP} className="text-gray-300 font-mono text-[10px] uppercase tracking-widest hover:text-[#f59e0b] transition-colors">
                        Login
                    </Link>
                    <Link href={ROUTES.SIGNUP} className="bg-white text-black px-5 py-2.5 rounded-sm font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                        Start Trial
                    </Link>
                </div>
            </div>
        </nav>
    );
}
