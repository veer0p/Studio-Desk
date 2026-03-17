import { PortalSessionProvider } from "@/lib/portal/session";
import { PortalNav } from "@/components/portal/PortalNav";
import Image from "next/image";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalSessionProvider>
      <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
        {/* Simple Branded Header */}
        <header className="h-20 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center px-6">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                 S
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900">StudioDesk <span className="text-primary">Portal</span></span>
           </div>
        </header>

        <main className="flex-1 w-full max-w-lg mx-auto px-6 py-8 pb-32">
          {children}
        </main>

        <PortalNav />

        <footer className="py-12 border-t border-slate-50 bg-slate-50/50 flex flex-col items-center gap-4">
           <div className="flex items-center gap-2 opacity-30 grayscale pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-widest">Powered by</span>
              <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white font-black text-[10px]">S</div>
              <span className="text-[10px] font-black tracking-tighter">StudioDesk</span>
           </div>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.2em]">Secure Client Environment</p>
        </footer>
      </div>
    </PortalSessionProvider>
  );
}
