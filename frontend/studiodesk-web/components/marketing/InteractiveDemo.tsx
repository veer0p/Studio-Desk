"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InteractiveDemo() {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    return (
        <div className="w-full relative rounded-md border border-white/10 bg-[#1A1D27] shadow-2xl p-6 overflow-hidden flex flex-col lg:flex-row gap-8">
            {/* Left side: Context */}
            <div className="lg:w-1/3 flex flex-col justify-center space-y-6">
                <div>
                    <h3 className="font-serif text-2xl text-white mb-2">Live Payment Demo</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        See how fast a client can pay you via UPI when they receive a Studio-Desk WhatsApp link.
                    </p>
                </div>

                {/* Progress Tracker */}
                <div className="space-y-4">
                    <div className={`flex items-center gap-3 transition-opacity ${step >= 1 ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`w-6 h-6 rounded-sm border ${step >= 1 ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-gray-700 bg-transparent text-gray-500'} flex items-center justify-center font-mono text-[10px]`}>
                            1
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-white">Generate Invoice</span>
                    </div>
                    <div className={`w-0.5 h-4 bg-gray-800 ml-[11px]`}></div>
                    <div className={`flex items-center gap-3 transition-opacity ${step >= 2 ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`w-6 h-6 rounded-sm border ${step >= 2 ? 'border-[#f59e0b] bg-[#f59e0b]/10 text-[#f59e0b]' : 'border-gray-700 bg-transparent text-gray-500'} flex items-center justify-center font-mono text-[10px]`}>
                            2
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-white">Client WhatsApp View</span>
                    </div>
                    <div className={`w-0.5 h-4 bg-gray-800 ml-[11px]`}></div>
                    <div className={`flex items-center gap-3 transition-opacity ${step >= 3 ? 'opacity-100' : 'opacity-40'}`}>
                        <div className={`w-6 h-6 rounded-sm border ${step >= 3 ? 'border-[#success] bg-success/10 text-success' : 'border-gray-700 bg-transparent text-gray-500'} flex items-center justify-center font-mono text-[10px]`}>
                            3
                        </div>
                        <span className={`font-mono text-[10px] uppercase tracking-widest ${step >= 3 ? 'text-success' : 'text-white'}`}>Payment Settled</span>
                    </div>
                </div>
            </div>

            {/* Right side: Interactive UI Mock */}
            <div className="lg:w-2/3 border border-white/5 bg-[#0f0f0f] rounded-sm p-2">
                <div className="h-full border border-white/5 bg-[#1A1D27]/50 rounded-sm p-4 relative min-h-[300px] flex flex-col items-center justify-center">

                    {step === 1 && (
                        <div className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="space-y-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Event Total (₹)</label>
                                <div className="h-10 w-full border border-white/10 bg-black/40 rounded-sm flex items-center px-4 font-mono text-white">
                                    1,50,000
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Advance Required</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 h-10 border border-[#f59e0b]/50 bg-[#f59e0b]/10 text-[#f59e0b] rounded-sm flex items-center justify-center font-mono text-xs cursor-pointer hover:bg-[#f59e0b]/20">50%</div>
                                    <div className="flex-1 h-10 border border-white/10 bg-black/40 text-gray-400 rounded-sm flex items-center justify-center font-mono text-xs cursor-pointer hover:bg-white/5">Custom</div>
                                </div>
                            </div>
                            <Button onClick={() => setStep(2)} className="w-full bg-[#f59e0b] hover:bg-[#d98205] text-black font-mono uppercase tracking-widest rounded-sm border-none h-12 text-[10px] font-bold">
                                Generate Payment Link
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="w-full max-w-xs space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <div className="bg-[#1F2C34] rounded-tr-lg rounded-bl-lg rounded-br-lg p-4 shadow-md inline-block max-w-full border border-white/5">
                                <p className="text-[#E9EDEF] text-sm mb-2">
                                    Hi Rahul! Your total wedding package is ₹1,50,000.
                                    Advance required to block dates: <span className="font-bold">₹75,000</span>.
                                </p>
                                <div className="bg-[#0f1117] border border-white/10 rounded-sm p-3 mt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-mono text-[10px] uppercase text-gray-400">StudioDesk Pay</span>
                                        <span className="font-mono text-sm text-[#f59e0b] font-bold">₹75,000</span>
                                    </div>
                                    <Button onClick={() => setStep(3)} className="w-full bg-white hover:bg-gray-200 text-black font-mono uppercase tracking-widest rounded-sm h-8 text-[9px] mt-2 font-bold">
                                        Pay Now via UPI
                                    </Button>
                                </div>
                            </div>
                            <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest text-center mt-4">Simulated WhatsApp View</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="w-full max-w-sm flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-90 duration-500">
                            <div className="w-20 h-20 rounded-full border border-success bg-success/20 flex items-center justify-center shadow-[0_0_30px_rgba(22,163,74,0.3)]">
                                <span className="text-4xl text-success font-serif">✓</span>
                            </div>
                            <div>
                                <h4 className="font-mono text-xl font-bold text-white mb-2 tracking-tight">Payment Received</h4>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">
                                    Transaction <span className="text-white">#UPI-9843A</span> • GST Invoice Sent
                                </p>
                            </div>
                            <Button onClick={() => setStep(1)} variant="outline" className="bg-transparent border-white/20 text-white hover:bg-white/5 font-mono uppercase tracking-widest rounded-sm h-10 px-6 text-[9px]">
                                Reset Demo
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
