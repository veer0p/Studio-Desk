import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-card">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
                <Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {description}
            </p>
            {action && (
                <Button onClick={action.onClick} className="mt-6 rounded-full">
                    {action.label}
                </Button>
            )}
        </div>
    )
}
