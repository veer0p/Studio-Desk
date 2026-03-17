"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UserPlus, 
  Calendar, 
  Users, 
  Receipt, 
  Images, 
  UsersRound, 
  Zap, 
  Settings, 
  Code,
  ChevronLeft,
  ChevronRight,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/dashboard/leads", icon: UserPlus, badge: "new_leads" },
  { label: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Invoices", href: "/dashboard/invoices", icon: Receipt, badge: "overdue_invoices" },
  { label: "Gallery", href: "/dashboard/gallery", icon: Images },
  { label: "Team", href: "/dashboard/team", icon: UsersRound, badge: "unconfirmed_assignments" },
  { label: "Automations", href: "/dashboard/automations", icon: Zap },
];

export function Sidebar({ className, counts = {} }: { className?: string, counts?: Record<string, number> }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useLocalStorage("sidebar-collapsed", false);

  return (
    <aside className={cn(
      "flex flex-col border-right bg-white transition-all duration-300",
      isCollapsed ? "w-16" : "w-[260px]",
      className
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-primary p-1.5 rounded-lg shrink-0">
            <Camera className="w-5 h-5 text-accent" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-tight whitespace-nowrap">StudioDesk</span>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const count = item.badge ? counts[item.badge] : 0;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                    isActive 
                      ? "bg-accent/10 text-accent" 
                      : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                  )}
                  title={isCollapsed ? item.label : ""}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-accent")} />
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!isCollapsed && count > 0 && (
                    <span className="bg-brand-red text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                  {isCollapsed && count > 0 && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full border-2 border-white" />
                  )}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-3 py-4">
          <div className="h-px bg-slate-100 mb-4" />
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/dashboard/settings" 
                    ? "bg-accent/10 text-accent" 
                    : "text-muted-foreground hover:bg-slate-50"
                )}
              >
                <Settings className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </Link>
            </li>
            <li>
              <a
                href="/api-docs"
                target="_blank"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-slate-50 transition-colors"
              >
                <Code className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>API Docs</span>}
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Footer / Toggle */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full h-10 flex items-center justify-center hover:bg-slate-50"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!isCollapsed && <span className="ml-2 text-xs text-muted-foreground">Collapse Sidebar</span>}
        </Button>
      </div>
    </aside>
  );
}
