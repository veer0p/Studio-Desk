"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CalendarDays, Receipt, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { useAuth } from "@/hooks/use-auth"
import { ROUTES } from "@/lib/constants/routes"

const MOBILE_NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", href: ROUTES.DASHBOARD },
    { icon: CalendarDays, label: "Bookings", href: ROUTES.BOOKINGS },
    { icon: Receipt, label: "Finance", href: ROUTES.FINANCE },
    { icon: ImageIcon, label: "Gallery", href: ROUTES.GALLERY },
]

export function BottomNav() {
    const pathname = usePathname()
    const { brandColor } = useAuth()

    return (
        <nav className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t bg-background md:hidden"
          style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}>
            {MOBILE_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 transition-colors duration-200",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}
                        style={isActive && brandColor ? { color: brandColor } : {}}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
