"use client"

import * as React from "react"
import { Camera, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { theme, setTheme } = useTheme()

    return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative">
            {/* Theme Toggle in Top Right */}
            <div className="absolute top-6 right-6">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>

            {/* Centered Auth Card */}
            <div className="max-w-md w-full rounded-3xl border bg-card p-4 sm:p-6 md:p-8 shadow-modal flex flex-col items-center">
                {/* Top Header */}
                <div className="flex flex-col items-center mb-8 gap-2">
                    <div className="h-12 w-12 rounded-xl bg-sidebar flex items-center justify-center mb-2">
                        <Camera className="h-[28px] w-[28px] text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        StudioDesk
                    </h1>
                </div>

                {/* Page Content */}
                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    )
}
