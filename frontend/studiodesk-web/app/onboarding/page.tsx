"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Camera, Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"

import { StepProgress } from "@/components/onboarding/step-progress"
import { useAuth } from "@/hooks/use-auth"

// Step Components
import { StepStudioDetails, type StudioDetailsValues } from "@/components/onboarding/step-studio-details"
import { StepServices, type ServicesValues } from "@/components/onboarding/step-services"
import { StepTeam, type TeamValues } from "@/components/onboarding/step-team"

const STEPS = [
    {
        title: "Studio Details",
        description: "Launch your brand identity",
    },
    {
        title: "Services",
        description: "What do you offer?",
    },
    {
        title: "Team",
        description: "Invite your collaborators",
    },
]

export default function OnboardingPage() {
    const router = useRouter()
    const { studio, mutate } = useAuth()
    const [currentStep, setCurrentStep] = React.useState(0)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [formData, setFormData] = React.useState({
        studioDetails: {
            name: studio?.name || "",
            slug: "",
            phone: "",
            city: "",
            state: "",
            currency: "INR",
        } as StudioDetailsValues,
        services: {
            services: []
        } as ServicesValues,
        team: {
            members: []
        } as TeamValues,
    })

    // Redirect if already onboarded
    React.useEffect(() => {
        if (studio?.onboarding_completed) {
            router.push("/dashboard")
        }
    }, [studio, router])

    const nextStep = () => {
        if (currentStep === STEPS.length - 1) {
            handleFinish()
        } else {
            setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
        }
    }

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

    const handleFinish = async () => {
        setIsSubmitting(true)
        try {
            // API integration would go here - for now we simulate
            // await updateStudioOnboarding(studio.id, formData)

            // 1. Submit Basic Info (Step 1)
            const step1Response = await fetch('/api/v1/studio/onboarding/1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: {
                        name: formData.studioDetails.name,
                        phone: formData.studioDetails.phone,
                        city: formData.studioDetails.city,
                        state: formData.studioDetails.state,
                    }
                }),
                credentials: 'include',
            })
            if (!step1Response.ok) throw new Error('Failed to save studio details')

            // 2. Submit Package (Step 5) - we map frontend services to backend first package
            if (formData.services.services.length > 0) {
                const mainService = formData.services.services[0]
                const step5Response = await fetch('/api/v1/studio/onboarding/5', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: {
                            package: {
                                name: mainService.name,
                                event_type: 'other', // Default as frontend doesn't have mapping yet
                                base_price: mainService.price,
                                deliverables: [],
                                turnaround_days: mainService.duration
                            }
                        }
                    }),
                    credentials: 'include',
                })
                if (!step5Response.ok) throw new Error('Failed to save services')
            } else {
                // If no services, just ping step 5 with empty data to complete
                await fetch('/api/v1/studio/onboarding/5', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: {} }),
                    credentials: 'include',
                })
            }

            toast.success("Welcome aboard! StudioDesk is ready.")
            mutate() // Refresh auth state
            router.push("/dashboard")
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <StepStudioDetails
                        defaultValues={formData.studioDetails}
                        onUpdate={(val) => setFormData((prev) => ({ ...prev, studioDetails: val }))}
                    />
                )
            case 1:
                return (
                    <StepServices
                        defaultValues={formData.services}
                        onUpdate={(val) => setFormData((prev) => ({ ...prev, services: val }))}
                    />
                )
            case 2:
                return (
                    <StepTeam
                        defaultValues={formData.team}
                        onUpdate={(val) => setFormData((prev) => ({ ...prev, team: val }))}
                    />
                )
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Sidebar - Progress */}
            <div className="hidden lg:flex w-[380px] bg-sidebar p-12 flex-col justify-between border-r shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-16">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            StudioDesk
                        </span>
                    </div>

                    <StepProgress currentStep={currentStep} steps={STEPS} />
                </div>

                <div className="mt-auto pt-8 border-t border-white/10">
                    <p className="text-sm text-sidebar-muted">
                        Need help? Contact our support team at
                        <br />
                        <span className="text-white font-medium">support@studiodesk.in</span>
                    </p>
                </div>
            </div>

            {/* Right Content - Forms */}
            <div className="flex-1 flex flex-col p-8 lg:p-24 overflow-y-auto">
                <div className="max-w-2xl w-full mx-auto">
                    {/* Mobile Header (Hidden on LG) */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <div className="h-12 w-12 rounded-xl bg-sidebar flex items-center justify-center mb-4">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold">Onboarding</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-4xl font-extrabold tracking-tight">
                                    {STEPS[currentStep].title}
                                </h2>
                                <p className="text-lg text-muted-foreground">
                                    {STEPS[currentStep].description}
                                </p>
                            </div>

                            <div className="bg-card rounded-3xl border p-8 shadow-sm">
                                {renderStep()}
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 0 || isSubmitting}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-0 transition-all font-sans"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={nextStep}
                                    disabled={isSubmitting}
                                    className="bg-primary text-primary-foreground h-12 px-10 rounded-xl font-semibold shadow-premium hover:opacity-90 active:scale-95 transition-all flex items-center justify-center min-w-[140px]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : currentStep === STEPS.length - 1 ? (
                                        "Complete Setup"
                                    ) : (
                                        "Continue"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}