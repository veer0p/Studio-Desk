"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import Step1StudioProfile from "./steps/Step1StudioProfile"
import Step2OwnerDetails from "./steps/Step2OwnerDetails"
import Step3TeamSetup from "./steps/Step3TeamSetup"
import Step4Packages from "./steps/Step4Packages"
import Step5GoLive from "./steps/Step5GoLive"

import type { Step1Data, Step2Data, Step3Data, Step4Data } from "@/lib/validations/onboarding"

const STEPS = [
  "Studio Profile",
  "Owner Details",
  "Team Setup",
  "Packages",
  "Go Live"
]

export default function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<{
    step1?: Step1Data;
    step2?: Step2Data;
    step3?: Step3Data;
    step4?: Step4Data;
  }>({})
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = (stepData: any) => {
    setFormData((prev) => ({ ...prev, [`step${currentStep}`]: stepData }))
    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSkip = () => {
    // If skipped, clear the form data for that specific step
    setFormData((prev) => ({ ...prev, [`step${currentStep}`]: undefined }))
    setCurrentStep((prev) => Math.min(prev + 1, 5))
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-border/60 bg-card p-6 md:p-10 shadow-sm relative overflow-hidden">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-sm font-medium text-foreground animate-pulse">Setting up your studio…</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-3 mb-10">
        <div className="flex gap-2">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                idx < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          Step {currentStep} of 5 — <span className="text-foreground">{STEPS[currentStep - 1]}</span>
        </p>
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {currentStep === 1 && (
          <Step1StudioProfile initialData={formData.step1} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <Step2OwnerDetails initialData={formData.step2} onNext={handleNext} onBack={handlePrev} />
        )}
        {currentStep === 3 && (
          <Step3TeamSetup initialData={formData.step3} onNext={handleNext} onBack={handlePrev} onSkip={handleSkip} />
        )}
        {currentStep === 4 && (
          <Step4Packages initialData={formData.step4} onNext={handleNext} onBack={handlePrev} onSkip={handleSkip} />
        )}
        {currentStep === 5 && (
          <Step5GoLive 
            formData={formData} 
            onBack={handlePrev} 
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        )}
      </div>
    </div>
  )
}
