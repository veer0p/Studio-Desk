import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

/**
 * EmptyState pattern used when lists or sections have no data.
 * centered: icon + title + description + optional CTA.
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 text-center",
            className
        )}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-xs mb-6">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} variant="default" size="sm">
                    {action.label}
                </Button>
            )}
        </div>
    )
}
