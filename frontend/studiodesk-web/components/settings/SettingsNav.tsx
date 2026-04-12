"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building, User, CreditCard, Package, IndianRupee, Bell, Plug, AlertTriangle, Zap, Gift, Flag, KeyRound, FileText, Wifi, Wallet, BookText } from "lucide-react"

const navLinks = [
  { href: "/settings/studio", label: "Studio Profile", icon: Building },
  { href: "/settings/owner", label: "Owner & Account", icon: User },
  { href: "/settings/billing", label: "Billing & Plan", icon: CreditCard },
  { href: "/settings/packages", label: "Packages", icon: Package },
  { href: "/settings/finance", label: "Finance & GST", icon: IndianRupee },
  { href: "/settings/payments", label: "Payments", icon: Wallet },
  { href: "/settings/automations", label: "Automations", icon: Zap },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
  { href: "/settings/api-keys", label: "API Keys", icon: KeyRound },
  { href: "/settings/templates", label: "Templates", icon: FileText },
  { href: "/settings/contract-clauses", label: "Clause Library", icon: BookText },
  { href: "/settings/feature-flags", label: "Feature Flags", icon: Flag },
  { href: "/settings/referral", label: "Referral", icon: Gift },
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
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-sm text-[10px] font-mono font-bold tracking-widest uppercase transition-colors whitespace-nowrap min-w-max relative border
              ${isActive 
                ? link.danger ? 'bg-red-500/5 text-red-600 border-red-500/20' : 'bg-foreground text-background border-foreground shadow-sm' 
                : link.danger ? 'text-red-500/70 border-transparent hover:bg-red-500/5 hover:text-red-500' : 'text-muted-foreground border-transparent hover:bg-muted/50 hover:text-foreground'
              }
            `}
          >
            {/* Active Indication Mapping Side-Tab Native Next Link Bounds */}
            {isActive && !link.danger && <div className="absolute left-[-1px] top-1/2 -translate-y-1/2 h-4 w-[2px] bg-background hidden md:block z-10" />}
            
            <link.icon className={`w-[14px] h-[14px] shrink-0 ${isActive && link.danger ? 'text-red-600' : isActive ? 'text-background' : 'text-muted-foreground group-hover:text-foreground/80'} transition-colors`} />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
