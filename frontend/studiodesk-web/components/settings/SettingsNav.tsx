"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building, User, CreditCard, Package, IndianRupee, Bell, Plug, AlertTriangle } from "lucide-react"

const navLinks = [
  { href: "/settings/studio", label: "Studio Profile", icon: Building },
  { href: "/settings/owner", label: "Owner & Account", icon: User },
  { href: "/settings/billing", label: "Billing & Plan", icon: CreditCard },
  { href: "/settings/packages", label: "Packages", icon: Package },
  { href: "/settings/finance", label: "Finance & GST", icon: IndianRupee },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
  { href: "/settings/danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
]

export function SettingsNav() {
  const pathname = usePathname()
  
  return (
    <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible custom-scrollbar pb-2 md:pb-0">
      {navLinks.map((link) => {
        const isActive = pathname === link.href
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-max relative
              ${isActive 
                ? link.danger ? 'bg-red-500/10 text-red-600' : 'bg-muted/60 text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                : link.danger ? 'text-red-500/70 hover:bg-red-500/5 hover:text-red-500' : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              }
            `}
          >
            {/* Active Indication Mapping Side-Tab Native Next Link Bounds */}
            {isActive && !link.danger && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[3px] bg-primary rounded-r-md hidden md:block" />}
            {isActive && link.danger && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[3px] bg-red-600 rounded-r-md hidden md:block" />}
            
            <link.icon className={`w-[18px] h-[18px] shrink-0 ${isActive && link.danger ? 'text-red-600' : isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground/80'} transition-colors`} />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
