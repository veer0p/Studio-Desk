import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";

export default function BookDemoPage() {
    return (
        <main className="min-h-screen bg-[#0f0f0f] text-[#F9FAFB] font-sans selection:bg-[#f59e0b] selection:text-black">
            <MarketingNav />
            {/* Narrative Header */}
            <section className="pt-24 pb-8 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
                <h1 className="font-serif text-4xl lg:text-5xl leading-[1.1] font-semibold max-w-3xl">
                    Let's map Studio-Desk to your exact <span className="text-[#f59e0b]">workflow</span>.
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl mt-2">
                    Spend 30 minutes with our product experts. We'll show you exactly how to automate your quotes, collect UPI payments, and manage your team calendar.
                </p>
            </section>

            {/* Mock Calendar Scheduling Embed */}
            <section className="py-8 max-w-5xl mx-auto px-6 mb-24">
                <div className="flex flex-col lg:flex-row bg-[#1A1D27] border border-white/10 rounded-sm overflow-hidden min-h-[500px]">

                    {/* Left Panel: Information */}
                    <div className="lg:w-1/3 p-8 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0f1117] flex flex-col justify-between">
                        <div>
                            <h3 className="font-serif text-2xl text-white mb-2">Studio-Desk Demo</h3>
                            <p className="text-gray-400 text-sm mb-6 flex items-center gap-2">
                                <span className="text-gray-500">⏱</span> 30 min • Zoom Video
                            </p>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Our team will screen-share a live Studio-Desk environment specifically tailored to your niche (Wedding, Portrait, or Commercial).
                            </p>
                        </div>
                        <div>
                            <h4 className="font-mono text-[10px] uppercase text-[#f59e0b] tracking-widest mb-3 border-t border-white/10 pt-4">What we'll cover:</h4>
                            <ul className="space-y-2 font-mono text-[11px] text-gray-300">
                                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Automated GST Quotations</li>
                                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> WhatsApp Payment Triggers</li>
                                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Face-Rec Gallery Delivery</li>
                                <li className="flex items-center gap-2"><span className="text-gray-500">✓</span> Data Migration from Excel</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Panel: Calendar Scheduling Logic (Mocked) */}
                    <div className="lg:w-2/3 p-8">
                        <h3 className="font-serif text-xl text-white mb-6">Select a Date & Time</h3>
                        <div className="flex gap-8">
                            {/* Calendar Mock */}
                            <div className="w-1/2">
                                <div className="flex justify-between items-center mb-4">
                                    <button className="text-gray-500 hover:text-white">&lt;</button>
                                    <span className="font-mono text-sm uppercase tracking-widest text-white">October 2026</span>
                                    <button className="text-gray-500 hover:text-white">&gt;</button>
                                </div>
                                <div className="grid grid-cols-7 gap-2 text-center text-gray-500 font-mono text-[10px] mb-2">
                                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {/* Fake days */}
                                    {Array.from({ length: 31 }).map((_, i) => (
                                        <div key={i} className={`aspect-square flex items-center justify-center font-mono text-xs rounded-sm cursor-pointer transition-colors ${i === 14 ? 'bg-[#f59e0b] text-black font-bold' : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'}`}>
                                            {i + 1}
                                        </div>
                                    ))}
                                </div>
                                <p className="font-mono text-[10px] uppercase text-gray-500 mt-6 tracking-widest">Timezone: Asia/Kolkata</p>
                            </div>

                            {/* Time Slots Mock */}
                            <div className="w-1/2 space-y-3">
                                <span className="font-mono text-xs text-gray-400 block mb-2">Wednesday, Oct 15</span>
                                <button className="w-full bg-white/5 border border-white/10 hover:border-[#f59e0b] hover:text-[#f59e0b] text-gray-300 font-mono py-3 rounded-sm text-sm transition-all text-center block">11:00 AM</button>
                                <button className="w-full bg-[#f59e0b] text-black font-bold font-mono py-3 rounded-sm text-sm transition-all text-center block shadow-[0_0_15px_rgba(245,158,11,0.2)]">12:30 PM</button>
                                <button className="w-full bg-white/5 border border-white/10 hover:border-[#f59e0b] hover:text-[#f59e0b] text-gray-300 font-mono py-3 rounded-sm text-sm transition-all text-center block">03:00 PM</button>
                                <button className="w-full bg-white/5 border border-white/10 hover:border-[#f59e0b] hover:text-[#f59e0b] text-gray-300 font-mono py-3 rounded-sm text-sm transition-all text-center block">05:30 PM</button>

                                <Button className="w-full mt-8 bg-white hover:bg-gray-200 text-black font-mono uppercase tracking-widest rounded-sm border-none h-12 text-[10px] font-bold">
                                    Confirm Booking
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

        </main>
    )
}
