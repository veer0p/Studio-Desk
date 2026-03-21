"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepProgressProps {
    currentStep: number
    steps: {
        title: string
        description: string
    }[]
}

export function StepProgress({ currentStep, steps }: StepProgressProps) {
    return (
        <nav aria-label="Progress" className="space-y-8">
            <ol role="list" className="space-y-8">
                {steps.map((step, stepIdx) => (
                    <li key={step.title} className="relative">
                        {stepIdx !== steps.length - 1 ? (
                            <div
                                className={cn(
                                    "absolute left-4 top-10 -ml-px h-full w-0.5",
                                    stepIdx < currentStep ? "bg-primary" : "bg-muted"
                                )}
                                aria-hidden="true"
                            />
                        ) : null}
                        <div className="group relative flex items-start">
                            <span className="flex h-9 items-center" aria-hidden="true">
                                <span
                                    className={cn(
                                        "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                                        stepIdx < currentStep
                                            ? "bg-primary border-primary"
                                            : stepIdx === currentStep
                                                ? "border-primary bg-background"
                                                : "border-muted bg-background"
                                    )}
                                >
                                    {stepIdx < currentStep ? (
                                        <Check className="h-5 w-5 text-primary-foreground" />
                                    ) : (
                                        <span
                                            className={cn(
                                                "h-2.5 w-2.5 rounded-full",
                                                stepIdx === currentStep ? "bg-primary" : "bg-transparent"
                                            )}
                                        />
                                    )}
                                </span>
                            </span>
                            <span className="ml-4 flex min-w-0 flex-col">
                                <span
                                    className={cn(
                                        "text-sm font-semibold tracking-wide uppercase",
                                        stepIdx <= currentStep ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </span>
                                <span className="text-sm text-muted-foreground mt-0.5">
                                    {step.description}
                                </span>
                            </span>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    )
}
