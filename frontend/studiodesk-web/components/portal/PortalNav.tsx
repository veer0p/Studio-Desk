"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlignLeft, LogOut, Settings, User } from "lucide-react"
import { ROUTES } from "@/lib/constants/routes"

export function PortalNav({ studioSlug }: { studioSlug: string }) {
  const pathname = usePathname()
  
  // Hide TopNav implicitly on login screen strictly matching decoupled specs
  if (pathname.includes('/login')) return null

  // Format studioSlug beautifully mimicking DB lookup
  const studioName = studioSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl h-16 flex items-center justify-between">
        
        {/* Left: Studio Branding */}
        <div className="flex items-center gap-4">
          <Link href={ROUTES.PORTAL_DASHBOARD(studioSlug)} className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="font-bold text-lg tracking-tight text-foreground">{studioName}</span>
          </Link>
        </div>

        {/* Right: Client Controls */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-muted border border-border/40 hover:bg-muted/80">
                <span className="font-semibold text-xs text-muted-foreground">RS</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Rohan Sharma</p>
                  <p className="text-xs leading-none text-muted-foreground">+91 98765 43210</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Notification Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out securely</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </header>
  )
}
