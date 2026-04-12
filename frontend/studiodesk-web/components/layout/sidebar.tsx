"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Receipt,
    Image as ImageIcon,
    Users2,
    BarChart2,
    Settings,
    Camera,
    LogOut,
    User,
    Sun,
    Moon,
    Contact2,
    FileText,
    ShieldCheck,
    Zap
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "@/lib/auth"
import { ROUTES } from "@/lib/constants/routes"

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: "Dashboard", href: ROUTES.DASHBOARD },
    { icon: Contact2, label: "Leads", href: ROUTES.LEADS },
    { icon: CalendarDays, label: "Bookings", href: ROUTES.BOOKINGS },
    { icon: Users, label: "Clients", href: ROUTES.CLIENTS },
    { icon: FileText, label: "Proposals", href: ROUTES.PROPOSALS },
    { icon: ShieldCheck, label: "Contracts", href: ROUTES.CONTRACTS },
    { icon: Receipt, label: "Finance", href: ROUTES.FINANCE },
    { icon: Zap, label: "Addons", href: ROUTES.ADDONS },
    { icon: ImageIcon, label: "Gallery", href: ROUTES.GALLERY },
    { icon: Users2, label: "Team", href: ROUTES.TEAM },
]

const BOTTOM_ITEMS = [
    { icon: BarChart2, label: "Analytics", href: ROUTES.ANALYTICS },
    { icon: Settings, label: "Settings", href: ROUTES.SETTINGS },
]

export function Sidebar() {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const { user, member, brandColor } = useAuth()

    const initials = member?.display_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || user?.email?.[0].toUpperCase() || "U"

    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <aside className="fixed left-0 top-0 z-40 hidden h-screen w-16 flex-col items-center border-r bg-sidebar md:flex">
            {/* Logo */}
            <div className="flex h-14 items-center justify-center">
                <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: brandColor || 'rgba(255, 255, 255, 0.1)' }}
                >
                    <Camera className="h-[22px] w-[22px] text-white" />
                </div>
            </div>

            <div className="h-px w-8 bg-white/10 my-2" />

            {/* Main Nav */}
            <nav className="flex flex-1 flex-col items-center gap-2 py-2">
                <TooltipProvider delayDuration={150}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex h-11 w-11 items-center justify-center transition-all duration-200",
                                            isActive
                                                ? "bg-sidebar-active text-white rounded-xl"
                                                : "text-sidebar-muted hover:bg-white/10 hover:text-white rounded-xl"
                                        )}
                                        style={isActive && brandColor ? { backgroundColor: brandColor } : {}}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="sr-only">{item.label}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={10}>
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </TooltipProvider>

                <div className="flex-1" />

                {/* Bottom Nav Items */}
                <TooltipProvider delayDuration={150}>
                    {BOTTOM_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex h-11 w-11 items-center justify-center transition-all duration-200",
                                            isActive
                                                ? "bg-sidebar-active text-white rounded-xl"
                                                : "text-sidebar-muted hover:bg-white/10 hover:text-white rounded-xl"
                                        )}
                                        style={isActive && brandColor ? { backgroundColor: brandColor } : {}}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="sr-only">{item.label}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" sideOffset={10}>
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        )
                    })}
                </TooltipProvider>
            </nav>

            <div className="h-px w-8 bg-white/10 my-2" />

            {/* User Avatar */}
            <div className="pb-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-white/10 rounded-full overflow-hidden border border-white/10">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-white/20 text-white text-xs font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" sideOffset={10} className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{member?.display_name || 'My Studio'}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={ROUTES.SETTINGS_OWNER} className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>My Profile</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={ROUTES.SETTINGS} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Studio Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="cursor-pointer"
                        >
                            {!mounted ? (
                                <div className="h-4 w-4 mr-2" />
                            ) : theme === "dark" ? (
                                <Sun className="mr-2 h-4 w-4" />
                            ) : (
                                <Moon className="mr-2 h-4 w-4" />
                            )}
                            <span>{!mounted ? '...' : theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                            onClick={() => signOut()}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    )
}
