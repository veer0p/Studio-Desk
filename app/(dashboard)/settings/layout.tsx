"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Building2, 
  CreditCard, 
  Bell, 
  Key, 
  Database,
  Users,
  MessageCircle,
  AlertTriangle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { id: 'studio', label: 'Studio Profile', icon: User, href: '/settings/studio' },
  { id: 'business', label: 'Business & Tax', icon: Building2, href: '/settings/business' },
  { id: 'payments', label: 'Payment Setup', icon: CreditCard, href: '/settings/payments' },
  { id: 'whatsapp', label: 'WhatsApp Setup', icon: MessageCircle, href: '/settings/whatsapp' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/settings/notifications' },
  { id: 'team', label: 'Team & Roles', icon: Users, href: '/settings/team' },
  { id: 'subscription', label: 'Subscription', icon: Database, href: '/settings/subscription' },
  { id: 'api-keys', label: 'API Keys', icon: Key, href: '/settings/api-keys' },
  { id: 'data', label: 'Data & Privacy', icon: AlertTriangle, href: '/settings/data' },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 shrink-0">
        <div className="bg-white rounded-[2rem] border border-slate-100 p-4 space-y-1 shadow-sm sticky top-24">
           <div className="px-4 py-3 mb-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Configuration</h2>
           </div>
           {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group",
                    isActive ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600")} />
                    <span className="text-sm font-bold tracking-tight">{item.label}</span>
                  </div>
                  {isActive && <div className="w-1 h-1 bg-primary rounded-full" />}
                </Link>
              );
           })}
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
