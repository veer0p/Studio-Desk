import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SkeletonStat({ className }: { className?: string }) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardHeader className="p-4 space-y-2 pb-2">
                <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <Skeleton className="h-8 w-32" />
            </CardContent>
        </Card>
    )
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <div className="aspect-video relative">
                <Skeleton className="h-full w-full rounded-none" />
            </div>
            <CardHeader className="p-4 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
            </CardHeader>
        </Card>
    )
}

export function SkeletonListItem({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center gap-4 p-4 border rounded-xl", className)}>
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
        </div>
    )
}

export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between py-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-64" />
            </div>
            <div className="border rounded-xl">
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex items-center gap-4 p-4",
                            i !== rows - 1 && "border-b"
                        )}
                    >
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        </div>
    )
}
