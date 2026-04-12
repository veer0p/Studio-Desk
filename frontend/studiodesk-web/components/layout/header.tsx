"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
    Search,
    Plus,
    Sun,
    Moon,
    CalendarPlus,
    UserPlus,
    Receipt,
    Sparkles,
    User,
    Settings,
    LogOut
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { NotificationBell } from "@/components/shared/NotificationBell"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "@/lib/auth"
import { ROUTES } from "@/lib/constants/routes"

const TITLE_MAP: Record<string, string> = {
    [ROUTES.DASHBOARD]: "Dashboard",
    [ROUTES.BOOKINGS]: "Bookings",
    [ROUTES.CLIENTS]: "Clients",
    [ROUTES.FINANCE]: "Finance",
    [ROUTES.GALLERY]: "Gallery",
    [ROUTES.TEAM]: "Team",
    [ROUTES.ANALYTICS]: "Analytics",
    [ROUTES.SETTINGS]: "Settings",
}

export function Header() {
    const pathname = usePathname()
    const { theme, setTheme } = useTheme()
    const { user, member } = useAuth()

    const initials = member?.display_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || user?.email?.[0].toUpperCase() || "U"

    // Find the title based on the pathname, handling sub-routes
    const title = Object.entries(TITLE_MAP).find(([path]) =>
        pathname === path || pathname.startsWith(path + "/")
    )?.[1] || "StudioDesk"

    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background/95 backdrop-blur-sm px-4 md:px-6 font-sans">
            {/* Left: Dynamic Title */}
            <div className="flex items-center">
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                    {title}
                </h1>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden flex-1 items-center justify-center md:flex">
                <div className="relative w-full max-w-sm lg:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="h-9 w-full rounded-full bg-muted/50 pl-9 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-3">
                {/* Notification Bell */}
                <NotificationBell />
                {/* + New Button */}
                <div className="hidden sm:block">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="rounded-full h-9 px-4">
                                <Plus className="mr-2 h-4 w-4" />
                                <span>New</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="cursor-pointer">
                                <CalendarPlus className="mr-2 h-4 w-4 text-primary" />
                                <span>New Booking</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <UserPlus className="mr-2 h-4 w-4 text-primary" />
                                <span>New Client</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Receipt className="mr-2 h-4 w-4 text-primary" />
                                <span>New Invoice</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                <span>New Lead</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="sm:hidden">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>

                {/* Notifications */}
                <NotificationBell />

                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {mounted ? (
                        theme === "dark" ? (
                            <Sun className="h-5 w-5 text-yellow-500" />
                        ) : (
                            <Moon className="h-5 w-5 text-slate-700" />
                        )
                    ) : (
                        <div className="h-5 w-5" />
                    )}
                </Button>

                {/* Avatar (Mobile friendly) */}
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{member?.display_name || 'My Studio'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>My Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Studio Settings</span>
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
            </div>
        </header>
    )
}
