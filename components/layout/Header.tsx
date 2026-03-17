"use client";

import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Menu, User, LogOut, Settings as SettingsIcon } from "lucide-react";

export function Header() {
  const router = useRouter();
  const { member, studio, role } = useCurrentStudio();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast.success("Signed out successfully");
  };

  const initials = member?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger will go here */}
        <div className="text-sm font-medium text-muted-foreground">
          {/* Breadcrumbs Placeholder */}
          Dashboard / Overview
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        <div className="h-8 w-px bg-slate-100 mx-2" />

        {/* User Profile / Menu (Simple implementation for now) */}
        <div className="flex items-center gap-3 pl-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold">{member?.full_name}</span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              {role} • {studio?.name}
            </span>
          </div>
          
          <div className="group relative">
            <button className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold border-2 border-slate-100 hover:border-accent transition-all">
              {initials || <User className="w-4 h-4" />}
            </button>
            
            {/* Simple Dropdown Overlay (native CSS hover for MVP) */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium truncate">{member?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{studio?.name}</p>
              </div>
              <button 
                onClick={() => router.push("/dashboard/settings/profile")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button 
                onClick={() => router.push("/dashboard/settings")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
              >
                <SettingsIcon className="w-4 h-4" /> Settings
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-brand-red hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
