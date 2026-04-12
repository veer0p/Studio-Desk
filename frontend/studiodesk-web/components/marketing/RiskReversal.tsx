import Link from 'next/link';
import { ROUTES } from "@/lib/constants/routes";

export function RiskReversal() {
    return (
        <>
            <section className="border-t border-white/10 bg-[#0f0f0f] py-8">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                            🔒
                        </div>
                        <div>
                            <p className="font-mono text-[11px] tracking-widest text-[#F9FAFB] uppercase font-bold">₹0 for 30 Days. No Credit Card.</p>
                            <p className="text-gray-400 text-[13px]">Cancel anytime. GST-ready from day one.</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-gray-500 font-mono text-[10px] uppercase tracking-widest bg-[#1A1D27] py-2 px-4 rounded-sm border border-white/5">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-success rounded-full"></span> AWS Mumbai Data
                        </span>
                        <span className="hidden sm:inline-block text-white/20">|</span>
                        <span className="flex items-center gap-1 text-[#f59e0b]">RBI Compliant</span>
                        <span className="hidden sm:inline-block text-white/20">|</span>
                        <span>ISO 27001</span>
                    </div>
                </div>
            </section>

            <footer className="border-t border-white/5 bg-[#0a0a0a] py-16 pb-28 md:pb-16 font-mono text-[10px] uppercase tracking-widest">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col gap-4">
                        <p className="text-white font-bold mb-2">Solutions</p>
                        <Link href={ROUTES.WEDDING_PHOTOGRAPHERS} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Wedding Studios</Link>
                        <Link href={ROUTES.PORTRAIT_STUDIOS} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Portrait Studios</Link>
                        <Link href={ROUTES.COMMERCIAL_VIDEO} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Commercial Video</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="text-white font-bold mb-2">Resources</p>
                        <Link href={ROUTES.BLOG} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Business Blog</Link>
                        <Link href={ROUTES.TEMPLATES} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Free Templates</Link>
                        <Link href={ROUTES.ONBOARDING} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Excel Migration</Link>
                        <Link href={ROUTES.GST_INVOICING} className="text-gray-500 hover:text-[#f59e0b] transition-colors">GST Guide</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="text-white font-bold mb-2">Product</p>
                        <Link href={ROUTES.FEATURES} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Features Pipeline</Link>
                        <Link href={ROUTES.PRICING} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Pricing & ROI</Link>
                        <Link href={ROUTES.CASE_STUDIES} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Case Studies</Link>
                        <Link href={ROUTES.CLIENT_GALLERY_FACE_RECOGNITION} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Face Recognition AI</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        <p className="text-white font-bold mb-2">Company</p>
                        <Link href={ROUTES.BOOK_DEMO} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Book a Demo</Link>
                        <Link href={ROUTES.SIGNUP} className="text-gray-500 hover:text-[#f59e0b] transition-colors">Start Trial</Link>
                    </div>
                </div>
            </footer>
        </>
    );
}
