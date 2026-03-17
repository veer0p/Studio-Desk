"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CreditCard, Image as ImageIcon, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/booking' },
  { id: 'payments', label: 'Payments', icon: CreditCard, href: '/booking/payment' },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon, href: '/booking/gallery' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/booking/messages' },
];

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 pb-safe pt-2 z-50">
       <div className="max-w-lg mx-auto flex justify-between items-center">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || (tab.id === 'overview' && pathname === '/booking');
            const Icon = tab.icon;
            
            return (
              <Link 
                key={tab.id} 
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-2 px-4 transition-all relative group",
                  isActive ? "text-primary" : "text-slate-300"
                )}
              >
                 <Icon className={cn(
                   "w-5 h-5 transition-transform",
                   isActive ? "scale-110 active:scale-90" : "group-hover:text-slate-400"
                 )} />
                 <span className={cn(
                   "text-[9px] font-black uppercase tracking-widest",
                   isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"
                 )}>
                    {tab.label}
                 </span>
                 {isActive && (
                   <div className="absolute -top-2 left-0 right-0 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(42,126,200,0.5)]" />
                 )}
                 {tab.id === 'messages' && (
                   <div className="absolute top-1 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                 )}
              </Link>
            );
          })}
       </div>
    </nav>
  );
}
