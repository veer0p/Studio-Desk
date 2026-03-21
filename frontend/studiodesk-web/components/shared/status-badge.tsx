"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { STATUS_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: keyof typeof STATUS_COLORS
    className?: string
}

/**
 * StatusBadge component uses shadcn Badge primitive.
 * Maps status strings to project-specific colors from lib/constants.ts
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
    const colorClass = STATUS_COLORS[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"

    // Format the label (e.g., 'new_lead' -> 'New Lead')
    const label = status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    return (
        <Badge
            variant="outline"
            className={cn("font-medium border-transparent shadow-none capitalize", colorClass, className)}
            role="status"
            aria-label={`${label} status`}
        >
            {label}
        </Badge>
    )
}
