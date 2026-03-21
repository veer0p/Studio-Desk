import * as React from "react"
import { cn } from "@/lib/utils"
import { formatINR, formatINRCompact } from "@/lib/format"

interface AmountDisplayProps {
    amount: number | string
    variant?: "compact" | "full"
    status?: "success" | "warning" | "danger" | "default" | "primary"
    className?: string
}

/**
 * AmountDisplay renders INR with correct color + format.
 * Always uses tabular-nums for vertical alignment in lists and tables.
 */
export function AmountDisplay({
    amount,
    variant = "full",
    status = "default",
    className,
}: AmountDisplayProps) {
    const formatted = variant === "compact"
        ? formatINRCompact(Number(amount))
        : formatINR(amount)

    const statusColors = {
        default: "text-foreground",
        primary: "text-primary",
        success: "text-emerald-600 dark:text-emerald-500",
        warning: "text-amber-600 dark:text-amber-500",
        danger: "text-red-600 dark:text-red-500",
    }

    return (
        <span className={cn(
            "font-bold tabular-nums",
            statusColors[status],
            className
        )}>
            {formatted}
        </span>
    )
}
