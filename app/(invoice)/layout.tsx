import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Payment | StudioDesk",
  description: "Securely pay your studio invoice via Razorpay.",
};

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 md:p-8 font-sans selection:bg-slate-900 selection:text-white">
      {/* Branding background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl z-10">
        <div className="flex justify-center mb-12">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl">
                 S
              </div>
              <span className="text-xl font-black uppercase tracking-tighter text-slate-900">StudioDesk</span>
           </div>
        </div>
        
        {children}

        <footer className="mt-16 text-center space-y-4">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Payment Secured & Processed by Razorpay
           </p>
           <div className="flex justify-center gap-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Refund Policy</span>
           </div>
        </footer>
      </div>
    </div>
  );
}
